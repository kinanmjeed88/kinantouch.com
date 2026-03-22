with open("admin/admin.js", "r", encoding="utf-8") as f:
    content = f.read()

# It seems `loadCategories` is missing in the file. `patch_admin_js.py` from earlier actually failed to replace `// --- API Helpers ---` because it wasn't exact. 
# Let's forcefully append it to the end or before API helpers if we can find it.

if "function loadCategories" not in content:
    # Find a good place to inject. The end of the file is safe, but we also need it to be called from switchTab
    inject_logic = """
// --- Categories Logic ---
let editingCategoryIndex = -1;

window.loadCategories = async function() {
    try {
        const path = 'content/data/categories.json';
        const fileData = await githubGet(path);
        
        if (fileData) {
            categories = JSON.parse(decodeBase64Unicode(fileData.content));
        } else {
            categories = [
                { id: "articles", name: "اخبار" },
                { id: "apps", name: "تطبيقات" },
                { id: "games", name: "ألعاب" },
                { id: "sports", name: "رياضة" }
            ];
            await saveCategoriesToGithub();
        }
    } catch (e) {
        console.error("Error loading categories:", e);
        categories = [];
    }
    renderCategories();
    updateCategoryDropdown();
}

window.renderCategories = function() {
    const list = document.getElementById('categoriesList');
    if(!list) return;
    
    const countEl = document.getElementById('categoriesCount');
    if(countEl) countEl.innerText = `${categories.length} أقسام`;
    
    list.innerHTML = '';
    
    if (categories.length === 0) {
        list.innerHTML = '<div class="text-center py-10 text-gray-400">لا توجد أقسام حالياً.</div>';
        return;
    }
    
    categories.forEach((cat, index) => {
        const div = document.createElement('div');
        div.className = "flex items-center justify-between p-3 sm:p-4 bg-white border border-gray-100 rounded-xl hover:shadow-md transition-shadow group";
        
        div.innerHTML = `
            <div class="flex items-center gap-4">
                <div class="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <i data-lucide="folder" class="w-5 h-5"></i>
                </div>
                <div>
                    <h3 class="font-bold text-gray-800">${cat.name}</h3>
                    <p class="text-xs text-gray-400 font-mono">${cat.id}</p>
                </div>
            </div>
            <div class="flex gap-2">
                <button class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" onclick="editCategory(${index})"><i data-lucide="edit-2" class="w-4 h-4"></i></button>
                <button class="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" onclick="deleteCategory(${index})"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
            </div>
        `;
        list.appendChild(div);
    });
    
    if (window.lucide) {
        lucide.createIcons();
    }
}

window.updateCategoryDropdown = function() {
    const select = document.getElementById('pCat');
    if(!select) return;
    
    const currentValue = select.value;
    select.innerHTML = '';
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.id;
        option.innerText = cat.name;
        select.appendChild(option);
    });
    if(currentValue) select.value = currentValue;
}

window.openCategoryEditor = () => {
    editingCategoryIndex = -1;
    document.getElementById('cId').value = '';
    document.getElementById('cId').disabled = false;
    document.getElementById('cName').value = '';
    document.getElementById('categoryEditorTitle').innerText = 'إضافة قسم جديد';
    document.getElementById('categoryEditor').classList.remove('hidden');
};

window.closeCategoryEditor = () => {
    document.getElementById('categoryEditor').classList.add('hidden');
};

window.editCategory = (index) => {
    editingCategoryIndex = index;
    const cat = categories[index];
    document.getElementById('cId').value = cat.id;
    document.getElementById('cId').disabled = true;
    document.getElementById('cName').value = cat.name;
    document.getElementById('categoryEditorTitle').innerText = 'تعديل القسم';
    document.getElementById('categoryEditor').classList.remove('hidden');
};

window.saveCategory = async () => {
    const id = document.getElementById('cId').value.trim();
    const name = document.getElementById('cName').value.trim();
    
    if(!id || !name) {
        alert("يرجى إدخال المعرف والاسم.");
        return;
    }
    
    if(editingCategoryIndex === -1 && categories.some(c => c.id === id)) {
        alert("المعرف موجود مسبقاً، يرجى اختيار معرف آخر.");
        return;
    }
    
    const newCat = { id, name };
    
    if (editingCategoryIndex > -1) {
        categories[editingCategoryIndex] = newCat;
    } else {
        categories.push(newCat);
    }
    
    closeCategoryEditor();
    renderCategories();
    updateCategoryDropdown();
    
    await saveCategoriesToGithub();
};

window.deleteCategory = async (index) => {
    if(!confirm("هل أنت متأكد من حذف هذا القسم؟ قد يؤثر ذلك على المقالات المرتبطة به.")) return;
    
    categories.splice(index, 1);
    renderCategories();
    updateCategoryDropdown();
    
    await saveCategoriesToGithub();
};

window.saveCategoriesToGithub = async function() {
    const path = 'content/data/categories.json';
    const contentToSave = JSON.stringify(categories, null, 2);
    
    let sha = null;
    try {
        const existing = await githubGet(path);
        if (existing) sha = existing.sha;
    } catch(e){}
    
    const btn = document.getElementById('categoriesCount'); 
    if(btn) btn.innerHTML = 'جاري الحفظ...';
    
    const success = await githubPut(path, contentToSave, sha, "Update categories");
    
    if(btn) btn.innerHTML = `${categories.length} أقسام`;
    
    if(success) {
        alert("تم حفظ الأقسام بنجاح! يُرجى إعادة بناء الموقع لتطبيق التغييرات على القوائم.");
    } else {
        alert("فشل حفظ الأقسام.");
    }
}
"""
    
    content += inject_logic
    
    with open("admin/admin.js", "w", encoding="utf-8") as f:
        f.write(content)
    print("Forcefully appended categories logic to admin.js")

