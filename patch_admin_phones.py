with open("admin/index.html", "r") as f:
    content = f.read()

# Add to Sidebar
sidebar_search = """            <button onclick="switchTab('stats')" id="nav-stats" class="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-gray-600 hover:bg-gray-50">
                <i data-lucide="bar-chart-2" class="w-5 h-5"></i>
                الإحصائيات
            </button>"""

sidebar_replace = """            <button onclick="switchTab('stats')" id="nav-stats" class="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-gray-600 hover:bg-gray-50">
                <i data-lucide="bar-chart-2" class="w-5 h-5"></i>
                الإحصائيات
            </button>
            <button onclick="switchTab('phones')" id="nav-phones" class="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-gray-600 hover:bg-gray-50">
                <i data-lucide="smartphone" class="w-5 h-5"></i>
                الهواتف (قاعدة البيانات)
            </button>"""

content = content.replace(sidebar_search, sidebar_replace)

# Add Phones Section
section_search = """        <section id="sec-stats" class="hidden-section space-y-6">"""

phones_section = """        <section id="sec-phones" class="hidden-section space-y-6">
            <div class="flex justify-between items-center">
                <h2 class="text-2xl font-bold">إدارة الهواتف الذكية</h2>
                <button onclick="openPhoneEditor()" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-200">
                    <i data-lucide="plus"></i> <span class="hidden sm:inline">هاتف جديد</span>
                </button>
            </div>
            
            <div class="bg-white p-4 rounded-xl border border-gray-200 mb-6 flex gap-4 items-center">
                <div class="flex-1">
                    <label class="label mb-1">تصفية حسب الشركة</label>
                    <select id="filterPhoneBrand" class="input-field" onchange="renderPhonesList()">
                        <option value="all">الكل</option>
                        <!-- Brands populated dynamically -->
                    </select>
                </div>
            </div>

            <div id="phonesLoader" class="flex justify-center py-12"><div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
            <div id="phonesList" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"></div>
        </section>

"""

content = content.replace(section_search, phones_section + section_search)

# Add Phone Editor Modal
modal_search = """        <div id="categoryEditor" class="hidden fixed inset-0 bg-white z-50 overflow-y-auto">"""

phone_modal = """        <!-- PHONE EDITOR MODAL -->
        <div id="phoneEditor" class="hidden fixed inset-0 bg-white z-50 overflow-y-auto">
            <div class="max-w-2xl mx-auto p-4 md:p-8 my-10 border rounded-2xl shadow-xl relative">
                <div class="flex justify-between items-center mb-6 border-b pb-4 sticky top-0 bg-white z-10 pt-4">
                    <h2 class="text-2xl font-bold" id="phoneEditorTitle">إضافة هاتف جديد</h2>
                    <button onclick="closePhoneEditor()" class="p-2 hover:bg-gray-100 rounded-full bg-gray-50"><i data-lucide="x"></i></button>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <input type="hidden" id="phId">
                    
                    <div class="col-span-full md:col-span-1">
                        <label class="label">الشركة المصنعة (Brand)</label>
                        <input type="text" id="phBrand" class="input-field" placeholder="مثال: Apple, Samsung, Xiaomi">
                    </div>
                    
                    <div class="col-span-full md:col-span-1">
                        <label class="label">اسم الهاتف (Name)</label>
                        <input type="text" id="phName" class="input-field" placeholder="مثال: iPhone 15 Pro Max" oninput="autoPhoneId()">
                    </div>

                    <div class="col-span-full md:col-span-1">
                        <label class="label">المعرف الفريد (ID) - يتولد تلقائياً</label>
                        <input type="text" id="phInternalId" class="input-field dir-ltr bg-gray-50" readonly>
                    </div>
                    
                    <div class="col-span-full md:col-span-1">
                        <label class="label">السعر التقريبي (اختياري)</label>
                        <input type="text" id="phPrice" class="input-field" placeholder="مثال: $999">
                    </div>

                    <!-- IMAGE UPLOAD -->
                    <div class="col-span-full p-4 border border-dashed border-gray-300 rounded-xl bg-gray-50">
                        <label class="label">صورة الهاتف</label>
                        <div class="flex gap-4 items-center">
                            <div class="w-24 h-24 rounded-lg border bg-white flex items-center justify-center overflow-hidden shrink-0">
                                <img id="phPreviewImg" src="" class="max-w-full max-h-full object-contain" onerror="this.src='assets/images/me.jpg'">
                            </div>
                            <div class="flex-1 space-y-2">
                                <input type="file" id="phFileInput" class="hidden" accept="image/*" onchange="handleFileSelect(this, 'phImageUrl', 'phPreviewImg')">
                                <button onclick="document.getElementById('phFileInput').click()" class="btn-secondary w-full text-sm"><i data-lucide="upload" class="w-4 h-4"></i> رفع صورة من الجهاز</button>
                                <input type="text" id="phImageUrl" class="input-field dir-ltr text-xs" placeholder="أو ضع رابط الصورة هنا..." oninput="document.getElementById('phPreviewImg').src=this.value">
                            </div>
                        </div>
                    </div>

                    <div class="col-span-full"><h3 class="font-bold text-lg border-b pb-2 mb-4 mt-2">المواصفات التقنية (Specs)</h3></div>

                    <div><label class="label">المعالج (Chipset)</label><input type="text" id="phSpecChipset" class="input-field" placeholder="مثال: A17 Pro"></div>
                    <div><label class="label">الرام (RAM)</label><input type="text" id="phSpecRam" class="input-field" placeholder="مثال: 8GB"></div>
                    <div><label class="label">التخزين (Storage)</label><input type="text" id="phSpecStorage" class="input-field" placeholder="مثال: 256GB/512GB/1TB"></div>
                    <div><label class="label">الشاشة (Screen)</label><input type="text" id="phSpecScreen" class="input-field" placeholder="مثال: 6.7 OLED 120Hz"></div>
                    <div><label class="label">البطارية (Battery)</label><input type="text" id="phSpecBattery" class="input-field" placeholder="مثال: 4441 mAh"></div>
                    <div><label class="label">الكاميرا (Camera)</label><input type="text" id="phSpecCamera" class="input-field" placeholder="مثال: 48MP Main"></div>
                </div>

                <div class="mt-8 pt-4 border-t flex justify-end gap-3 sticky bottom-0 bg-white pb-4">
                    <button onclick="closePhoneEditor()" class="text-gray-500 hover:text-gray-700 font-bold px-4">إلغاء</button>
                    <button onclick="savePhone()" class="btn-primary w-40 shadow-lg shadow-blue-200">حفظ الهاتف</button>
                </div>
            </div>
        </div>

"""

content = content.replace(modal_search, phone_modal + modal_search)

with open("admin/index.html", "w") as f:
    f.write(content)

