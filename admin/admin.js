
// --- Configuration & State ---
let ghConfig = {
    owner: localStorage.getItem('gh_owner') || '',
    repo: localStorage.getItem('gh_repo') || '',
    token: localStorage.getItem('gh_token') || ''
};

let cachedPosts = [];
let cachedChannels = [];
let cachedAbout = {};

// Icon Picker State
let iconPickerTarget = null; // { type: 'channel'|'social', id: index|key }
const commonIcons = [
    'star', 'heart', 'globe', 'link', 'home', 'user', 'settings', 'search', 'menu', 'x', 
    'check', 'alert-circle', 'info', 'mail', 'phone', 'map-pin', 'camera', 'image', 'video', 
    'music', 'mic', 'headphones', 'play', 'pause', 'download', 'upload', 'share', 'edit', 
    'trash', 'plus', 'minus', 'chevron-right', 'chevron-left', 'arrow-right', 'arrow-left',
    'facebook', 'instagram', 'youtube', 'twitter', 'linkedin', 'github', 'send', 'message-circle',
    'smartphone', 'monitor', 'cpu', 'gamepad-2', 'joystick', 'trophy', 'activity', 'tv',
    'bot', 'folder', 'folder-plus', 'file-text', 'file', 'scissors', 'wand-2'
];

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    initIconPicker();
    if (!ghConfig.token) {
        document.getElementById('ghModal').classList.remove('hidden');
    } else {
        loadPosts(); // Load initial tab data
    }
});

// --- Tab Switching ---
window.switchTab = (tabName) => {
    // UI Update
    document.querySelectorAll('aside button').forEach(btn => btn.classList.remove('tab-active'));
    document.getElementById(`nav-${tabName}`).classList.add('tab-active');
    
    // Section Visibility
    document.querySelectorAll('section').forEach(sec => sec.classList.add('hidden-section'));
    document.getElementById(`sec-${tabName}`).classList.remove('hidden-section');

    // Data Load
    if (tabName === 'posts') loadPosts();
    if (tabName === 'channels') loadChannels();
    if (tabName === 'settings') loadSettings();
};

// --- GitHub API Helpers ---
const api = {
    base: () => `https://api.github.com/repos/${ghConfig.owner}/${ghConfig.repo}/contents`,
    headers: () => ({ 
        'Authorization': `token ${ghConfig.token}`,
        'Content-Type': 'application/json'
    }),
    
    async get(path) {
        const res = await fetch(`${this.base()}/${path}?t=${Date.now()}`, { headers: this.headers() });
        if (!res.ok) throw new Error(`API Error: ${res.status}`);
        return await res.json();
    },

    async put(path, content, msg, sha = null) {
        // Safe UTF-8 encoding for Arabic content
        const body = { 
            message: msg, 
            content: btoa(unescape(encodeURIComponent(content))) 
        };
        if (sha) body.sha = sha;
        
        const res = await fetch(`${this.base()}/${path}`, {
            method: 'PUT', headers: this.headers(), body: JSON.stringify(body)
        });
        if (!res.ok) throw new Error('Save Failed');
        return await res.json();
    },

    async delete(path, sha, msg) {
        const res = await fetch(`${this.base()}/${path}`, {
            method: 'DELETE', headers: this.headers(),
            body: JSON.stringify({ message: msg, sha: sha })
        });
        if (!res.ok) throw new Error('Delete Failed');
    },

    async uploadImage(file) {
        const reader = new FileReader();
        return new Promise((resolve, reject) => {
            reader.onload = async () => {
                const b64 = reader.result.split(',')[1];
                const fileName = `assets/images/${Date.now()}_${file.name.replace(/\s/g, '_')}`;
                await fetch(`${this.base()}/${fileName}`, {
                    method: 'PUT', headers: this.headers(),
                    body: JSON.stringify({ message: 'Upload Image via CMS', content: b64 })
                });
                // Return relative path for the site
                resolve(fileName);
            };
            reader.readAsDataURL(file);
        });
    }
};

// --- ICON PICKER LOGIC ---
function initIconPicker() {
    const grid = document.getElementById('iconGrid');
    commonIcons.forEach(iconName => {
        const div = document.createElement('div');
        div.className = 'icon-option';
        div.innerHTML = `<i data-lucide="${iconName}" class="w-5 h-5"></i>`;
        div.onclick = () => selectLucideIcon(iconName);
        grid.appendChild(div);
    });
}

window.openIconPickerForChannel = (index) => {
    iconPickerTarget = { type: 'channel', id: index };
    openPickerModal();
};

window.openIconPickerForSocial = (key) => {
    iconPickerTarget = { type: 'social', id: key };
    openPickerModal();
};

function openPickerModal() {
    document.getElementById('iconPickerModal').classList.remove('hidden');
    // Reset to default state
    switchPickerTab('lucide');
    document.getElementById('pickerSize').value = 24;
    updateSizeDisplay(24);
    document.getElementById('pickerUrl').value = '';
    document.getElementById('pickerPreviewImg').classList.add('hidden');
    document.getElementById('pickerPlaceholder').classList.remove('hidden');
    lucide.createIcons();
}

window.closeIconPicker = () => {
    document.getElementById('iconPickerModal').classList.add('hidden');
    iconPickerTarget = null;
};

window.switchPickerTab = (tab) => {
    document.querySelectorAll('.modal-tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`tab-btn-${tab}`).classList.add('active');
    
    document.querySelectorAll('.picker-tab').forEach(t => t.classList.add('hidden'));
    document.getElementById(`picker-${tab}`).classList.remove('hidden');
};

window.updateSizeDisplay = (val) => {
    document.getElementById('sizeDisplay').innerText = `${val}px`;
    const prev = document.getElementById('pickerPreviewImg');
    if(prev) { prev.style.width = val + 'px'; prev.style.height = val + 'px'; }
};

window.selectLucideIcon = (iconName) => {
    const size = document.getElementById('pickerSize').value;
    applyIconChange({ type: 'lucide', value: iconName, size: size });
};

window.handlePickerFileSelect = async (input) => {
    if (input.files && input.files[0]) {
        const btn = document.getElementById('btnUploadPicker'); 
        btn.innerText = 'جاري الرفع...'; btn.disabled = true;
        try {
            const url = await api.uploadImage(input.files[0]);
            document.getElementById('pickerUrl').value = url;
            updatePickerPreview(url);
        } catch(e) { alert('Upload failed: ' + e.message); }
        btn.innerHTML = '<i data-lucide="upload"></i> رفع صورة'; btn.disabled = false;
        lucide.createIcons();
    }
};

window.updatePickerPreview = (url) => {
    const img = document.getElementById('pickerPreviewImg');
    const ph = document.getElementById('pickerPlaceholder');
    if (url) {
        img.src = url.startsWith('http') ? url : `../${url}`; // Preview adjustment
        img.classList.remove('hidden');
        ph.classList.add('hidden');
        const size = document.getElementById('pickerSize').value;
        img.style.width = size + 'px'; img.style.height = size + 'px';
    } else {
        img.classList.add('hidden');
        ph.classList.remove('hidden');
    }
};

window.confirmImageSelection = () => {
    const url = document.getElementById('pickerUrl').value;
    const size = document.getElementById('pickerSize').value;
    if(!url) return alert('يرجى اختيار صورة أو رابط');
    applyIconChange({ type: 'image', value: url, size: size });
};

function applyIconChange(iconData) {
    if (!iconPickerTarget) return;

    if (iconPickerTarget.type === 'channel') {
        cachedChannels[iconPickerTarget.id].iconData = iconData;
        cachedChannels[iconPickerTarget.id].icon = iconData.value; 
        renderChannels();
    } else if (iconPickerTarget.type === 'social') {
        const btn = document.getElementById(`btnIcon_${iconPickerTarget.id}`);
        btn.dataset.iconInfo = JSON.stringify(iconData);
        
        if(iconData.type === 'image') {
            btn.innerHTML = `<img src="${iconData.value}" style="width:24px; height:24px; object-fit:contain;">`;
        } else {
            btn.innerHTML = `<i data-lucide="${iconData.value}"></i>`;
            lucide.createIcons();
        }
    }
    closeIconPicker();
}

// --- POSTS LOGIC (CRUD) ---
async function loadPosts() {
    const list = document.getElementById('postsList');
    const loader = document.getElementById('postsLoader');
    list.innerHTML = '';
    loader.classList.remove('hidden');

    try {
        const files = await api.get('content/posts');
        cachedPosts = [];
        const promises = files.map(async file => {
            if (!file.name.endsWith('.json')) return;
            const data = await api.get(file.path);
            const content = JSON.parse(decodeURIComponent(escape(atob(data.content))));
            cachedPosts.push({ ...content, sha: data.sha, path: file.path });
        });
        await Promise.all(promises);

        // Sort by 'updated' date if available, else 'date'
        cachedPosts.sort((a, b) => {
            const dateA = new Date(a.updated || a.date);
            const dateB = new Date(b.updated || b.date);
            return dateB - dateA;
        });

        loader.classList.add('hidden');
        renderPosts();
    } catch (e) {
        console.error(e);
        loader.classList.add('hidden');
        list.innerHTML = `<div class="text-center text-red-500">حدث خطأ في تحميل المقالات. تأكد من الإعدادات.</div>`;
    }
}

function renderPosts() {
    const list = document.getElementById('postsList');
    list.innerHTML = cachedPosts.map(p => {
        const isUpdated = p.updated && p.updated !== p.date;
        const dateDisplay = isUpdated 
            ? `<span class="text-blue-500 font-bold" title="تم التحديث">♻ ${p.updated}</span>` 
            : `<span>${p.date}</span>`;

        return `
        <div class="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center hover:shadow-md transition-all">
            <div class="flex items-center gap-4">
                <img src="${p.image.startsWith('http') ? p.image : '../'+p.image}" class="w-16 h-10 object-cover rounded-md bg-gray-100" onerror="this.src='../assets/images/me.jpg'">
                <div>
                    <h3 class="font-bold text-gray-800 line-clamp-1">${p.title}</h3>
                    <div class="text-xs text-gray-400 flex gap-2 items-center">
                        ${dateDisplay}
                        <span>•</span>
                        <span class="bg-gray-100 px-2 py-0.5 rounded text-gray-600">${p.category}</span>
                    </div>
                </div>
            </div>
            <div class="flex gap-2 shrink-0">
                <button onclick="editPost('${p.slug}')" class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><i data-lucide="edit-2" class="w-4 h-4"></i></button>
                <button onclick="deletePost('${p.slug}')" class="p-2 text-red-600 hover:bg-red-50 rounded-lg"><i data-lucide="trash" class="w-4 h-4"></i></button>
            </div>
        </div>
    `}).join('');
    lucide.createIcons();
}

window.openPostEditor = () => {
    document.getElementById('postEditor').classList.remove('hidden');
    ['pTitle', 'pSlug', 'pDesc', 'pContent', 'pImage'].forEach(id => document.getElementById(id).value = '');
    document.getElementById('pSlug').dataset.mode = 'new';
    document.getElementById('pSlug').readOnly = false;
    document.getElementById('editorTitle').innerText = 'مقال جديد';
};

window.closePostEditor = () => document.getElementById('postEditor').classList.add('hidden');

window.editPost = (slug) => {
    const p = cachedPosts.find(x => x.slug === slug);
    if (!p) return;
    document.getElementById('pTitle').value = p.title;
    document.getElementById('pSlug').value = p.slug;
    document.getElementById('pSlug').readOnly = true; // Cannot change slug on edit to avoid dupes/404s
    document.getElementById('pSlug').dataset.mode = 'edit';
    document.getElementById('pCat').value = p.category;
    document.getElementById('pDesc').value = p.description;
    document.getElementById('pContent').value = p.content;
    document.getElementById('pImage').value = p.image;
    document.getElementById('editorTitle').innerText = 'تعديل مقال';
    document.getElementById('postEditor').classList.remove('hidden');
};

window.savePost = async () => {
    const btn = document.getElementById('btnSavePost');
    btn.innerText = 'جاري الحفظ...';
    btn.disabled = true;
    try {
        const slug = document.getElementById('pSlug').value.trim() || 'untitled';
        const isEdit = document.getElementById('pSlug').dataset.mode === 'edit';
        const existingPost = isEdit ? cachedPosts.find(p => p.slug === slug) : null;
        
        const now = new Date().toISOString().split('T')[0];

        // Ensure Smart Dates Logic
        const postData = {
            title: document.getElementById('pTitle').value,
            slug: slug,
            description: document.getElementById('pDesc').value,
            category: document.getElementById('pCat').value,
            // If edit, keep original creation date, update 'updated'. If new, set 'date' only.
            date: isEdit ? existingPost.date : now,
            updated: isEdit ? now : undefined, 
            image: document.getElementById('pImage').value,
            content: document.getElementById('pContent').value
        };

        // If newly created but updated immediately, clean up undefined
        if(!postData.updated) delete postData.updated;

        const path = `content/posts/${slug}.json`;
        let sha = existingPost ? existingPost.sha : null;
        
        await api.put(path, JSON.stringify(postData, null, 2), `Update Post: ${postData.title}`, sha);
        
        showToast('تم حفظ المقال بنجاح!');
        closePostEditor();
        loadPosts();
    } catch (e) { 
        alert('خطأ في الحفظ: ' + e.message); 
    } finally { 
        btn.innerText = 'حفظ ونشر'; 
        btn.disabled = false; 
    }
};

window.deletePost = async (slug) => {
    if(!confirm('هل أنت متأكد من الحذف؟ هذا الإجراء لا يمكن التراجع عنه.')) return;
    const p = cachedPosts.find(x => x.slug === slug);
    try { 
        await api.delete(p.path, p.sha, `Delete Post: ${slug}`); 
        showToast('تم الحذف'); 
        loadPosts(); 
    } catch(e) { 
        alert(e.message); 
    }
};

// --- EDITOR HELPERS (Markdown) ---
window.insertYoutube = () => {
    const url = prompt("أدخل رابط فيديو يوتيوب (مثال: https://www.youtube.com/watch?v=...)");
    if (url) {
        // Extract ID for cleaner format if needed, but let generator handle full URL
        const embedCode = `\n@[youtube](${url})\n`;
        window.insertTag(embedCode);
    }
};

window.insertLink = () => {
    const url = prompt("أدخل رابط الموقع (URL):", "https://");
    if (!url) return;
    const text = prompt("أدخل النص الذي سيظهر على الزر:", "اضغط هنا للدخول للموقع");
    const linkCode = `[${text || 'اضغط هنا'}](${url})`;
    window.insertTag(linkCode);
};

// --- CHANNELS LOGIC ---
async function loadChannels() {
    const loader = document.getElementById('channelsLoader');
    loader.classList.remove('hidden');
    try {
        const file = await api.get('content/data/channels.json');
        cachedChannels = JSON.parse(decodeURIComponent(escape(atob(file.content))));
        cachedChannels.sha = file.sha;
        renderChannels();
    } catch(e) { console.error(e); }
    loader.classList.add('hidden');
}

function renderChannels() {
    const list = document.getElementById('channelsList');
    list.innerHTML = cachedChannels.map((ch, index) => {
        let iconHtml = '';
        if (ch.iconData && ch.iconData.type === 'image') {
            const size = ch.iconData.size || 24;
            iconHtml = `<img src="${ch.iconData.value}" style="width:${size}px; height:${size}px; object-fit:contain;">`;
        } else {
            const iconName = (ch.iconData && ch.iconData.value) ? ch.iconData.value : ch.icon;
            iconHtml = `<i data-lucide="${iconName || 'star'}"></i>`;
        }

        return `
        <div class="bg-white p-4 rounded-xl border border-gray-100 flex items-center gap-4 group">
            <button onclick="openIconPickerForChannel(${index})" class="w-12 h-12 flex items-center justify-center bg-${ch.color || 'blue'}-100 text-${ch.color || 'blue'}-600 rounded-lg hover:bg-gray-200 transition-colors overflow-hidden">
                ${iconHtml}
            </button>
            <div class="flex-1">
                <input type="text" value="${ch.name}" class="font-bold text-gray-800 w-full bg-transparent mb-1 outline-none focus:border-b border-blue-500" onchange="updateChannel(${index}, 'name', this.value)">
                <input type="text" value="${ch.desc}" class="text-xs text-gray-400 w-full bg-transparent outline-none focus:border-b border-blue-500" onchange="updateChannel(${index}, 'desc', this.value)">
                <input type="text" value="${ch.url}" class="text-xs text-blue-400 w-full bg-transparent outline-none focus:border-b border-blue-500 mt-1" onchange="updateChannel(${index}, 'url', this.value)">
            </div>
            <div class="opacity-0 group-hover:opacity-100 transition-opacity">
                <button onclick="removeChannel(${index})" class="text-red-500 p-2"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
            </div>
        </div>
    `}).join('');
    
    // Ensure save button exists
    if(!document.getElementById('btnSaveChannels')) {
        const btn = document.createElement('button');
        btn.id = 'btnSaveChannels';
        btn.className = 'w-full bg-purple-600 text-white py-3 rounded-xl font-bold mt-4';
        btn.innerText = 'حفظ التغييرات على القنوات';
        btn.onclick = saveChannels;
        list.parentElement.appendChild(btn);
    }
    lucide.createIcons();
}

window.addChannel = () => { cachedChannels.push({ id: Date.now(), name: 'جديد', desc: 'وصف', url: '#', icon: 'star', color: 'gray' }); renderChannels(); };
window.updateChannel = (index, field, value) => { cachedChannels[index][field] = value; };
window.removeChannel = (index) => { if(!confirm('حذف هذا العنصر؟')) return; cachedChannels.splice(index, 1); renderChannels(); };
window.saveChannels = async () => {
    const btn = document.getElementById('btnSaveChannels'); btn.innerText = 'جاري الحفظ...';
    try {
        const dataToSave = cachedChannels.filter(x => x);
        await api.put('content/data/channels.json', JSON.stringify(dataToSave, null, 2), 'Update Channels', cachedChannels.sha);
        showToast('تم تحديث القنوات');
        const file = await api.get('content/data/channels.json'); cachedChannels.sha = file.sha;
    } catch(e) { alert(e.message); }
    btn.innerText = 'حفظ التغييرات على القنوات';
};

// --- SETTINGS LOGIC ---
async function loadSettings() {
    const loader = document.getElementById('settingsLoader');
    const form = document.getElementById('settingsForm');
    loader.classList.remove('hidden');
    form.classList.add('hidden');

    try {
        const file = await api.get('content/data/about.json');
        cachedAbout = JSON.parse(decodeURIComponent(escape(atob(file.content))));
        cachedAbout.sha = file.sha;

        // Branding & Site Name
        document.getElementById('siteName').value = cachedAbout.siteName || "TechTouch";
        
        // Category Settings
        const cats = cachedAbout.categories?.labels || { articles: "اخبار", apps: "تطبيقات", games: "ألعاب", sports: "رياضة" };
        document.getElementById('catLabel_articles').value = cats.articles;
        document.getElementById('catLabel_apps').value = cats.apps;
        document.getElementById('catLabel_games').value = cats.games;
        document.getElementById('catLabel_sports').value = cats.sports;
        
        const catFontSize = cachedAbout.categories?.fontSize || 14;
        document.getElementById('catFontSize').value = catFontSize;
        document.getElementById('catSizeVal').innerText = catFontSize;

        document.getElementById('valName').value = cachedAbout.profileName;
        document.getElementById('previewProfile').src = cachedAbout.profileImage.startsWith('http') ? cachedAbout.profileImage : `../${cachedAbout.profileImage}`;
        document.getElementById('valProfileImg').value = cachedAbout.profileImage;
        document.getElementById('valBio').value = cachedAbout.bio;
        
        if (cachedAbout.ticker) {
            document.getElementById('tickerLabel').value = cachedAbout.ticker.label;
            document.getElementById('tickerText').value = cachedAbout.ticker.text;
            document.getElementById('tickerUrl').value = cachedAbout.ticker.url;
            
            // Ticker Font Size (Load existing or default 14)
            const fontSize = cachedAbout.ticker.fontSize || 14;
            document.getElementById('tickerSize').value = fontSize;
            document.getElementById('tickerSizeVal').innerText = fontSize;
        }

        document.getElementById('valBotInfo').value = cachedAbout.botInfo || "";
        document.getElementById('valSearchInfo').value = cachedAbout.searchInfo || "";
        document.getElementById('valBotTitle').value = cachedAbout.botTitle || "مركز خدمة الطلبات (Bot)";
        document.getElementById('valSearchTitle').value = cachedAbout.searchTitle || "دليل الوصول الذكي للمحتوى";

        const coverType = cachedAbout.coverType || 'color';
        const rb = document.querySelector(`input[name="coverType"][value="${coverType}"]`);
        if(rb) rb.checked = true;
        
        if(coverType === 'color') document.getElementById('valCoverColor').value = cachedAbout.coverValue;
        else document.getElementById('valCoverImg').value = cachedAbout.coverValue;
        toggleCoverInput();

        document.getElementById('socFb').value = cachedAbout.social.facebook;
        document.getElementById('socInsta').value = cachedAbout.social.instagram;
        document.getElementById('socTikTok').value = cachedAbout.social.tiktok;
        document.getElementById('socYt').value = cachedAbout.social.youtube;
        document.getElementById('socTg').value = cachedAbout.social.telegram;

        const socialIcons = cachedAbout.socialIcons || {};
        const setupIconBtn = (key, defaultIconName) => {
            const btn = document.getElementById(`btnIcon_${key}`);
            let data = socialIcons[key];
            if (typeof data === 'string') { data = { type: 'lucide', value: data, size: 24 }; } 
            else if (!data) { data = { type: 'lucide', value: defaultIconName, size: 24 }; }

            btn.dataset.iconInfo = JSON.stringify(data);
            if (data.type === 'image') {
                btn.innerHTML = `<img src="${data.value}" style="width:${data.size}px; height:${data.size}px; object-fit:contain;">`;
            } else {
                btn.innerHTML = `<i data-lucide="${data.value}"></i>`;
            }
        };

        setupIconBtn('facebook', 'facebook');
        setupIconBtn('instagram', 'instagram');
        setupIconBtn('tiktok', 'video');
        setupIconBtn('youtube', 'youtube');
        setupIconBtn('telegram', 'send');
        
        lucide.createIcons();
        loader.classList.add('hidden');
        form.classList.remove('hidden');
    } catch(e) { console.error(e); }
}

window.toggleCoverInput = () => {
    const type = document.querySelector('input[name="coverType"]:checked')?.value || 'color';
    if(type === 'color') {
        document.getElementById('coverColorInput').classList.remove('hidden');
        document.getElementById('coverImageInput').classList.add('hidden');
    } else {
        document.getElementById('coverColorInput').classList.add('hidden');
        document.getElementById('coverImageInput').classList.remove('hidden');
    }
};

window.saveSettingsData = async () => {
    const btn = document.getElementById('btnSaveSettings');
    btn.innerText = 'جاري الحفظ...';
    try {
        const coverType = document.querySelector('input[name="coverType"]:checked').value;
        const getIconData = (key) => JSON.parse(document.getElementById(`btnIcon_${key}`).dataset.iconInfo || '{}');

        const newSettings = {
            profileName: document.getElementById('valName').value,
            profileImage: document.getElementById('valProfileImg').value,
            bio: document.getElementById('valBio').value,
            botInfo: document.getElementById('valBotInfo').value,
            searchInfo: document.getElementById('valSearchInfo').value,
            botTitle: document.getElementById('valBotTitle').value,
            searchTitle: document.getElementById('valSearchTitle').value,
            coverType: coverType,
            coverValue: coverType === 'color' ? document.getElementById('valCoverColor').value : document.getElementById('valCoverImg').value,
            // New Fields
            siteName: document.getElementById('siteName').value,
            categories: {
                labels: {
                    articles: document.getElementById('catLabel_articles').value,
                    apps: document.getElementById('catLabel_apps').value,
                    games: document.getElementById('catLabel_games').value,
                    sports: document.getElementById('catLabel_sports').value
                },
                fontSize: document.getElementById('catFontSize').value
            },
            ticker: {
                label: document.getElementById('tickerLabel').value,
                text: document.getElementById('tickerText').value,
                url: document.getElementById('tickerUrl').value,
                fontSize: document.getElementById('tickerSize').value
            },
            social: {
                facebook: document.getElementById('socFb').value,
                instagram: document.getElementById('socInsta').value,
                tiktok: document.getElementById('socTikTok').value,
                youtube: document.getElementById('socYt').value,
                telegram: document.getElementById('socTg').value
            },
            socialIcons: {
                facebook: getIconData('facebook'),
                instagram: getIconData('instagram'),
                tiktok: getIconData('tiktok'),
                youtube: getIconData('youtube'),
                telegram: getIconData('telegram'),
            }
        };
        await api.put('content/data/about.json', JSON.stringify(newSettings, null, 2), 'Update Settings', cachedAbout.sha);
        showToast('تم تحديث الإعدادات');
        const file = await api.get('content/data/about.json'); cachedAbout.sha = file.sha;
    } catch(e) { alert(e.message); }
    btn.innerText = 'حفظ التغييرات';
};

// --- UTILS ---
window.toggleGithubSettings = () => document.getElementById('ghModal').classList.toggle('hidden');
window.saveGhSettings = () => {
    localStorage.setItem('gh_owner', document.getElementById('ghOwner').value.trim());
    localStorage.setItem('gh_repo', document.getElementById('ghRepo').value.trim());
    localStorage.setItem('gh_token', document.getElementById('ghToken').value.trim());
    location.reload();
};

function arabicToLatin(str) {
    const map = {
        'أ': 'a', 'إ': 'e', 'آ': 'a', 'ا': 'a', 'ب': 'b', 'ت': 't', 'ث': 'th',
        'ج': 'j', 'ح': 'h', 'خ': 'kh', 'د': 'd', 'ذ': 'th', 'ر': 'r', 'ز': 'z',
        'س': 's', 'ش': 'sh', 'ص': 's', 'ض': 'd', 'ط': 't', 'ظ': 'z', 'ع': 'a',
        'غ': 'gh', 'ف': 'f', 'ق': 'q', 'ك': 'k', 'ل': 'l', 'م': 'm', 'ن': 'n',
        'ه': 'h', 'و': 'w', 'ي': 'y', 'ى': 'a', 'ة': 'h', 'ء': 'a', 'ئ': 'e', 'ؤ': 'o'
    };
    return str.split('').map(char => map[char] || char).join('');
}

window.autoSlug = () => {
    const title = document.getElementById('pTitle').value;
    if (document.getElementById('pSlug').dataset.mode === 'new') {
        let latinized = arabicToLatin(title);
        let slug = latinized.toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-');
        
        if(slug.length < 2) slug = 'post-' + Date.now();
        document.getElementById('pSlug').value = slug.substring(0, 60);
    }
};

window.handleFileSelect = async (input, targetId, previewId = null) => {
    if (input.files && input.files[0]) {
        const btn = input.nextElementSibling; btn.innerText = '...'; btn.disabled = true;
        try {
            const url = await api.uploadImage(input.files[0]);
            document.getElementById(targetId).value = url;
            if(previewId) document.getElementById(previewId).src = '../' + url;
        } catch(e) { alert('Upload failed: ' + e.message); }
        btn.innerText = 'رفع'; btn.disabled = false;
    }
};

window.insertTag = (tag) => {
    const ta = document.getElementById('pContent');
    const start = ta.selectionStart; const end = ta.selectionEnd;
    ta.value = ta.value.substring(0, start) + tag + ta.value.substring(end);
    ta.focus();
    ta.selectionStart = ta.selectionEnd = start + tag.length;
};

function showToast(msg) {
    const t = document.getElementById('toast'); document.getElementById('toastMsg').innerText = msg;
    t.classList.remove('translate-y-[-100%]', 'opacity-0'); setTimeout(() => t.classList.add('translate-y-[-100%]', 'opacity-0'), 3000);
}
