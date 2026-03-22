with open("admin/index.html", "r", encoding="utf-8") as f:
    content = f.read()

# I see the problem. When I modified the HTML the first time, I replaced "CHANNELS VIEW", but I need to make sure the CATEGORIES section is actually inside a <section id="sec-categories"> to work with the switchTab logic we just wrote, or my previous python script failed to inject it because the target string was different. Let's look at the actual content.

search_content = """        <section id="sec-channels" class="hidden-section space-y-6">
            <div class="flex justify-between items-center"><h2 class="text-2xl font-bold">القنوات والمواقع</h2><button onclick="addChannel()" class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2"><i data-lucide="plus"></i> إضافة</button></div>
            <div id="channelsLoader" class="flex justify-center py-12"><div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div></div>
            <div id="channelsList" class="grid grid-cols-1 md:grid-cols-2 gap-4"></div>
        </section>"""

replace_content = """        <section id="sec-channels" class="hidden-section space-y-6">
            <div class="flex justify-between items-center"><h2 class="text-2xl font-bold">القنوات والمواقع</h2><button onclick="addChannel()" class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2"><i data-lucide="plus"></i> إضافة</button></div>
            <div id="channelsLoader" class="flex justify-center py-12"><div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div></div>
            <div id="channelsList" class="grid grid-cols-1 md:grid-cols-2 gap-4"></div>
        </section>

        <!-- ================= CATEGORIES VIEW ================= -->
        <section id="sec-categories" class="hidden-section h-full flex flex-col space-y-6">
            <div class="flex justify-between items-center">
                <h2 class="text-2xl font-bold">إدارة الأقسام</h2>
                <button onclick="openCategoryEditor()" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-200">
                    <i data-lucide="plus"></i> <span class="hidden sm:inline">قسم جديد</span>
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
        </section>"""

content = content.replace(search_content, replace_content)

with open("admin/index.html", "w", encoding="utf-8") as f:
    f.write(content)
print("Re-added categories section with correct ID")
