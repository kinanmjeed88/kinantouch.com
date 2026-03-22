with open("admin/index.html", "r", encoding="utf-8") as f:
    content = f.read()

# Add Categories tab button
search_nav = """            <button onclick="switchTab('channels')" id="nav-channels" class="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-gray-600 hover:bg-gray-50">
                <i data-lucide="grid" class="w-5 h-5"></i>
                القنوات والأدوات
            </button>"""
replace_nav = """            <button onclick="switchTab('channels')" id="nav-channels" class="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-gray-600 hover:bg-gray-50">
                <i data-lucide="grid" class="w-5 h-5"></i>
                القنوات والأدوات
            </button>
            <button onclick="switchTab('categories')" id="nav-categories" class="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-gray-600 hover:bg-gray-50">
                <i data-lucide="folder-tree" class="w-5 h-5"></i>
                الأقسام
            </button>"""
content = content.replace(search_nav, replace_nav)

# Add Categories content section
search_content = """        <!-- ================= CHANNELS VIEW ================= -->"""
replace_content = """        <!-- ================= CATEGORIES VIEW ================= -->
        <div id="view-categories" class="hidden h-full flex flex-col">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h2 class="text-3xl font-extrabold tracking-tight text-gray-900 mb-1">إدارة الأقسام</h2>
                    <p class="text-gray-500 font-medium">إضافة، تعديل وحذف الأقسام التي تظهر في الصفحة الرئيسية</p>
                </div>
                <button onclick="openCategoryEditor()" class="btn-primary flex items-center gap-2 shadow-blue-500/30">
                    <i data-lucide="plus" class="w-5 h-5"></i> قسم جديد
                </button>
            </div>
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 flex-1 overflow-hidden flex flex-col">
                <div class="p-4 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
                    <h3 class="font-bold text-gray-700">الأقسام الحالية</h3>
                    <span class="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full" id="categoriesCount">0 أقسام</span>
                </div>
                <div class="p-4 overflow-y-auto max-h-[60vh] custom-scroll">
                    <div id="categoriesList" class="flex flex-col gap-3">
                        <div class="text-center py-10 text-gray-400">جاري التحميل...</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- ================= CHANNELS VIEW ================= -->"""
content = content.replace(search_content, replace_content)

# Add Category Editor Modal
search_modal = """    <!-- ================= EDITORS (MODALS) ================= -->"""
replace_modal = """    <!-- ================= EDITORS (MODALS) ================= -->
    <div id="categoryEditor" class="hidden fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
        <div class="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
            <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 class="text-lg font-bold text-gray-800" id="categoryEditorTitle">إضافة قسم</h3>
                <button onclick="closeCategoryEditor()" class="text-gray-400 hover:text-red-500 transition-colors p-1"><i data-lucide="x" class="w-5 h-5"></i></button>
            </div>
            <div class="p-6 space-y-4">
                <div>
                    <label class="label">المعرف (ID - باللغة الإنجليزية بدون مسافات)</label>
                    <input type="text" id="cId" class="input-field dir-ltr" placeholder="مثال: sports" oninput="this.value = this.value.toLowerCase().replace(/[^a-z0-9_-]/g, '')">
                </div>
                <div>
                    <label class="label">الاسم المعروض (عربي)</label>
                    <input type="text" id="cName" class="input-field" placeholder="مثال: رياضة">
                </div>
            </div>
            <div class="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                <button onclick="closeCategoryEditor()" class="px-5 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-200 transition-colors">إلغاء</button>
                <button onclick="saveCategory()" class="btn-primary px-8">حفظ</button>
            </div>
        </div>
    </div>
"""
content = content.replace(search_modal, replace_modal)

with open("admin/index.html", "w", encoding="utf-8") as f:
    f.write(content)
print("Updated admin/index.html")
