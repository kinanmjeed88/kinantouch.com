with open("admin/index.html", "r", encoding="utf-8") as f:
    content = f.read()

# Add Category Editor Modal again because it was missed
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
print("Updated admin/index.html modal")
