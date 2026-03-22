import re

with open("admin/admin.js", "r", encoding="utf-8") as f:
    content = f.read()

# Add categories state
search_state = """let posts = [];
let channels = [];
let aboutData = {};"""
replace_state = """let posts = [];
let channels = [];
let categories = [];
let aboutData = {};"""
content = content.replace(search_state, replace_state)

# Load categories in init()
search_init = """    try { await loadPosts(); } catch(e){}
    try { await loadChannels(); } catch(e){}"""
replace_init = """    try { await loadPosts(); } catch(e){}
    try { await loadChannels(); } catch(e){}
    try { await loadCategories(); } catch(e){}"""
content = content.replace(search_init, replace_init)

# Add loadCategories function
search_funcs = """// --- API Helpers ---"""
replace_funcs = """// --- Categories Logic ---
let editingCategoryIndex = -1;

async function loadCategories() {
    try {
        const path = 'content/data/categories.json';
        const fileData = await githubGet(path);
        
        if (fileData) {
            categories = JSON.parse(decodeBase64Unicode(fileData.content));
        } else {
            // Default categories if file doesn't exist
            categories = [
                { id: "articles", name: "اخبار" },
                { id: "apps", name: "تطبيقات" },
                { id: "games", name: "ألعاب" },
                { id: "sports", name: "رياضة" }
            ];
            await saveCategoriesToGithub(); // Create the file
        }
    } catch (e) {
        console.error("Error loading categories:", e);
        categories = [];
    }
    renderCategories();
    updateCategoryDropdown();
}

function renderCategories() {
    const list = document.getElementById('categoriesList');
    if(!list) return;
    
    document.getElementById('categoriesCount').innerText = `${categories.length} أقسام`;
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
    
    // Re-initialize icons
    if (window.lucide) {
        lucide.createIcons();
    }
}

function updateCategoryDropdown() {
    const select = document.getElementById('pCat');
    if(!select) return;
    
    select.innerHTML = '';
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.id;
        option.innerText = cat.name;
        select.appendChild(option);
    });
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
    document.getElementById('cId').disabled = true; // Don't allow changing ID to avoid breaking existing posts
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
    
    // Check if ID already exists when creating new
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

async function saveCategoriesToGithub() {
    const path = 'content/data/categories.json';
    const content = JSON.stringify(categories, null, 2);
    
    let sha = null;
    try {
        const existing = await githubGet(path);
        if (existing) sha = existing.sha;
    } catch(e){}
    
    const btn = document.createElement('button'); // dummy for loader
    showLoader(btn);
    
    const success = await githubPut(path, content, sha, "Update categories");
    
    hideLoader(btn, 'Saved');
    
    if(success) {
        alert("تم حفظ الأقسام بنجاح!");
    } else {
        alert("فشل حفظ الأقسام.");
    }
}

// --- API Helpers ---"""
content = content.replace("// --- API Helpers ---", replace_funcs)

# Switch Tabs logic Update
search_switch = """    document.getElementById('view-posts').classList.add('hidden');
    document.getElementById('view-channels').classList.add('hidden');
    document.getElementById('view-settings').classList.add('hidden');"""
replace_switch = """    document.getElementById('view-posts').classList.add('hidden');
    document.getElementById('view-channels').classList.add('hidden');
    document.getElementById('view-categories').classList.add('hidden');
    document.getElementById('view-settings').classList.add('hidden');"""
content = content.replace(search_switch, replace_switch)

search_switch2 = """    const ids = ['posts', 'channels', 'settings'];"""
replace_switch2 = """    const ids = ['posts', 'channels', 'categories', 'settings'];"""
content = content.replace(search_switch2, replace_switch2)


with open("admin/admin.js", "w", encoding="utf-8") as f:
    f.write(content)
print("Updated admin/admin.js")
