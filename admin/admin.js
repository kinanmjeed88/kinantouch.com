
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
    document.querySelectorAll('aside button').forEach(btn => btn.classList.remove('tab-active'));
    document.getElementById(`nav-${tabName}`).classList.add('tab-active');
    document.querySelectorAll('section').forEach(sec => sec.classList.add('hidden-section'));
    document.getElementById(`sec-${tabName}`).classList.remove('hidden-section');
    if (tabName === 'posts') loadPosts();
    if (tabName === 'channels') loadChannels();
    if (tabName === 'settings') loadSettings();
};

// --- IMAGE COMPRESSION LOGIC (WebP) ---
async function compressAndConvertToWebP(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 1200; // Limit max width
                const scaleSize = MAX_WIDTH / img.width;
                
                let width = img.width;
                let height = img.height;

                // Resize if too big
                if (scaleSize < 1) {
                    width = MAX_WIDTH;
                    height = img.height * scaleSize;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // Convert to WebP with 0.8 quality
                const webpData = canvas.toDataURL('image/webp', 0.8);
                // Return base64 string without prefix for GitHub API
                resolve(webpData.split(',')[1]); 
            };
            img.onerror = (error) => reject(error);
        };
        reader.onerror = (error) => reject(error);
    });
}

// --- GitHub API Helpers ---
const api = {
    base: () => `https://api.github.com/repos/${ghConfig.owner}/${ghConfig.repo}/contents`,
    headers: () => ({ 'Authorization': `token ${ghConfig.token}`, 'Content-Type': 'application/json' }),
    async get(path) {
        const res = await fetch(`${this.base()}/${path}?t=${Date.now()}`, { headers: this.headers() });
        if (!res.ok) throw new Error(`API Error: ${res.status}`);
        return await res.json();
    },
    async put(path, content, msg, sha = null) {
        const body = { message: msg, content: btoa(unescape(encodeURIComponent(content))) };
        if (sha) body.sha = sha;
        const res = await fetch(`${this.base()}/${path}`, { method: 'PUT', headers: this.headers(), body: JSON.stringify(body) });
        if (!res.ok) throw new Error('Save Failed');
        return await res.json();
    },
    async delete(path, sha, msg) {
        const res = await fetch(`${this.base()}/${path}`, { method: 'DELETE', headers: this.headers(), body: JSON.stringify({ message: msg, sha: sha }) });
        if (!res.ok) throw new Error('Delete Failed');
    },
    async uploadImage(file) {
        try {
            // Compress image to WebP before uploading
            const b64 = await compressAndConvertToWebP(file);
            // Change extension to .webp
            const originalName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
            const fileName = `assets/images/${Date.now()}_${originalName.replace(/\s/g, '_')}.webp`;
            
            await fetch(`${this.base()}/${fileName}`, { 
                method: 'PUT', 
                headers: this.headers(), 
                body: JSON.stringify({ message: 'Upload Compressed WebP via CMS', content: b64 }) 
            });
            return fileName;
        } catch (e) {
            console.error("Compression/Upload Error:", e);
            throw e;
        }
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

window.openIconPickerForChannel = (index) => { iconPickerTarget = { type: 'channel', id: index }; openPickerModal(); };
window.openIconPickerForSocial = (key) => { iconPickerTarget = { type: 'social', id: key }; openPickerModal(); };

function openPickerModal() {
    document.getElementById('iconPickerModal').classList.remove('hidden');
    switchPickerTab('lucide');
    document.getElementById('pickerSize').value = 24;
    updateSizeDisplay(24);
    document.getElementById('pickerUrl').value = '';
    document.getElementById('pickerPreviewImg').classList.add('hidden');
    document.getElementById('pickerPlaceholder').classList.remove('hidden');
    lucide.createIcons();
}

window.closeIconPicker = () => { document.getElementById('iconPickerModal').classList.add('hidden'); iconPickerTarget = null; };
window.switchPickerTab = (tab) => {
    document.querySelectorAll('.modal-tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`tab-btn-${tab}`).classList.add('active');
    document.querySelectorAll('.picker-tab').forEach(t => t.classList.add('hidden'));
    document.getElementById(`picker-${tab}`).classList.remove('hidden');
};
window.updateSizeDisplay = (val) => { document.getElementById('sizeDisplay').innerText = `${val}px`; const prev = document.getElementById('pickerPreviewImg'); if(prev) { prev.style.width = val + 'px'; prev.style.height = val + 'px'; } };
window.selectLucideIcon = (iconName) => { const size = document.getElementById('pickerSize').value; applyIconChange({ type: 'lucide', value: iconName, size: size }); };
window.handlePickerFileSelect = async (input) => {
    if (input.files && input.files[0]) {
        const btn = document.getElementById('btnUploadPicker'); btn.innerText = 'جاري الضغط والرفع...'; btn.disabled = true;
        try { const url = await api.uploadImage(input.files[0]); document.getElementById('pickerUrl').value = url; updatePickerPreview(url); } catch(e) { alert('Upload failed: ' + e.message); }
        btn.innerHTML = '<i data-lucide="upload"></i> رفع صورة'; btn.disabled = false; lucide.createIcons();
    }
};
window.updatePickerPreview = (url) => {
    const img = document.getElementById('pickerPreviewImg'); const ph = document.getElementById('pickerPlaceholder');
    if (url) { img.src = url.startsWith('http') ? url : `../${url}`; img.classList.remove('hidden'); ph.classList.add('hidden'); const size = document.getElementById('pickerSize').value; img.style.width = size + 'px'; img.style.height = size + 'px'; } else { img.classList.add('hidden'); ph.classList.remove('hidden'); }
};
window.confirmImageSelection = () => { const url = document.getElementById('pickerUrl').value; const size = document.getElementById('pickerSize').value; if(!url) return alert('يرجى اختيار صورة أو رابط'); applyIconChange({ type: 'image', value: url, size: size }); };

function applyIconChange(iconData) {
    if (!iconPickerTarget) return;
    if (iconPickerTarget.type === 'channel') { cachedChannels[iconPickerTarget.id].iconData = iconData; cachedChannels[iconPickerTarget.id].icon = iconData.value; renderChannels(); }
    else if (iconPickerTarget.type === 'social') {
        const btn = document.getElementById(`btnIcon_${iconPickerTarget.id}`); btn.dataset.iconInfo = JSON.stringify(iconData);
        if(iconData.type === 'image') { btn.innerHTML = `<img src="${iconData.value}" style="width:24px; height:24px; object-fit:contain;">`; } else { btn.innerHTML = `<i data-lucide="${iconData.value}"></i>`; lucide.createIcons(); }
    }
    closeIconPicker();
}

// --- POSTS LOGIC ---
async function loadPosts() {
    const list = document.getElementById('postsList'); const loader = document.getElementById('postsLoader');
    list.innerHTML = ''; loader.classList.remove('hidden');
    try {
        const files = await api.get('content/posts'); cachedPosts = [];
        const promises = files.map(async file => { if (!file.name.endsWith('.json')) return; const data = await api.get(file.path); const content = JSON.parse(decodeURIComponent(escape(atob(data.content)))); cachedPosts.push({ ...content, sha: data.sha, path: file.path }); });
        await Promise.all(promises);
        
        // Robust Date Sorting
        cachedPosts.sort((a, b) => {
            const dateA = new Date(a.updated || a.date).getTime();
            const dateB = new Date(b.updated || b.date).getTime();
            return dateB - dateA;
        });
        
        loader.classList.add('hidden'); renderPosts();
    } catch (e) { console.error(e); loader.classList.add('hidden'); list.innerHTML = `<div class="text-center text-red-500">حدث خطأ في تحميل المقالات.<br>تأكد من إعدادات الاتصال.</div>`; }
}
function renderPosts() {
    const list = document.getElementById('postsList');
    list.innerHTML = cachedPosts.map(p => {
        const dateDisplay = (p.updated && p.updated !== p.date) ? `<span class="text-blue-500 font-bold" title="تم التحديث">♻ ${p.updated}</span>` : `<span>${p.date}</span>`;
        return `<div class="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center hover:shadow-md transition-all"><div class="flex items-center gap-4"><img src="${p.image.startsWith('http') ? p.image : '../'+p.image}" class="w-16 h-10 object-cover rounded-md bg-gray-100"><div class="flex-1 min-w-0"><h3 class="font-bold text-gray-800 line-clamp-1">${p.title}</h3><div class="text-xs text-gray-400 flex gap-2 items-center">${dateDisplay}<span>•</span><span class="bg-gray-100 px-2 py-0.5 rounded text-gray-600">${p.category}</span></div></div></div><div class="flex gap-2 shrink-0"><button onclick="editPost('${p.slug}')" class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><i data-lucide="edit-2" class="w-4 h-4"></i></button><button onclick="deletePost('${p.slug}')" class="p-2 text-red-600 hover:bg-red-50 rounded-lg"><i data-lucide="trash" class="w-4 h-4"></i></button></div></div>`;
    }).join(''); lucide.createIcons();
}
window.openPostEditor = () => { 
    document.getElementById('postEditor').classList.remove('hidden'); 
    ['pTitle', 'pSlug', 'pDesc', 'pContent', 'pImage', 'pYoutubeId'].forEach(id => {
        const el = document.getElementById(id);
        if(el) el.value = '';
    }); 
    document.getElementById('pSlug').dataset.mode = 'new'; 
    document.getElementById('pSlug').readOnly = false; 
    document.getElementById('editorTitle').innerText = 'مقال جديد'; 
};
window.closePostEditor = () => document.getElementById('postEditor').classList.add('hidden');
window.editPost = (slug) => { 
    const p = cachedPosts.find(x => x.slug === slug); 
    if (!p) return; 
    
    // Safely set values checking if elements exist
    const setVal = (id, val) => { const el = document.getElementById(id); if(el) el.value = val; };
    
    setVal('pTitle', p.title);
    setVal('pSlug', p.slug);
    
    const slugEl = document.getElementById('pSlug');
    if(slugEl) {
        slugEl.readOnly = true; 
        slugEl.dataset.mode = 'edit';
    }
    
    setVal('pCat', p.category);
    setVal('pDesc', p.description);
    setVal('pContent', p.content);
    setVal('pImage', p.image);
    
    // Set Extras
    setVal('pYoutubeId', p.youtubeVideoId || '');

    document.getElementById('editorTitle').innerText = 'تعديل مقال'; 
    document.getElementById('postEditor').classList.remove('hidden'); 
};
window.savePost = async () => {
    const btn = document.getElementById('btnSavePost'); btn.innerText = 'جاري الحفظ...'; btn.disabled = true;
    try {
        let slug = document.getElementById('pSlug').value.trim();
        // Fallback slug if empty
        if (!slug) slug = 'post-' + Date.now();
        
        const isEdit = document.getElementById('pSlug').dataset.mode === 'edit'; 
        const existingPost = isEdit ? cachedPosts.find(p => p.slug === slug) : null; 
        const now = new Date().toISOString().split('T')[0];
        
        // Helper to get value safely
        const getVal = (id) => { const el = document.getElementById(id); return el ? el.value : ''; };

        const postData = { 
            title: getVal('pTitle'), 
            slug: slug, 
            description: getVal('pDesc'), 
            category: getVal('pCat'), 
            date: (isEdit && existingPost) ? existingPost.date : now, 
            updated: (isEdit) ? now : undefined, 
            image: getVal('pImage'), 
            content: getVal('pContent'),
            // Removed AI fields (summary, points)
            youtubeVideoId: getVal('pYoutubeId')
        };
        // Clean undefined updated
        if(!postData.updated) delete postData.updated;
        
        await api.put(`content/posts/${slug}.json`, JSON.stringify(postData, null, 2), `Update Post: ${postData.title}`, existingPost ? existingPost.sha : null);
        showToast('تم حفظ المقال! انتظر 2-3 دقائق للتحديث.'); closePostEditor(); loadPosts();
    } catch (e) { alert('خطأ في الحفظ: ' + e.message); } finally { btn.innerText = 'حفظ ونشر'; btn.disabled = false; }
};
window.deletePost = async (slug) => { if(!confirm('حذف؟')) return; const p = cachedPosts.find(x => x.slug === slug); try { await api.delete(p.path, p.sha, `Delete Post: ${slug}`); showToast('تم الحذف'); loadPosts(); } catch(e) { alert(e.message); } };

window.insertYoutube = () => { const url = prompt("رابط يوتيوب:"); if (url) window.insertTag(`\n@[youtube](${url})\n`); };
window.insertLink = () => { const url = prompt("الرابط:"); const text = prompt("النص:"); if(url) window.insertTag(`[${text || 'اضغط هنا'}](${url})`); };

// --- CHANNELS LOGIC ---
async function loadChannels() {
    const loader = document.getElementById('channelsLoader'); loader.classList.remove('hidden');
    try { const file = await api.get('content/data/channels.json'); cachedChannels = JSON.parse(decodeURIComponent(escape(atob(file.content)))); cachedChannels.sha = file.sha; renderChannels(); } catch(e) { console.error(e); } loader.classList.add('hidden');
}
function renderChannels() {
    const list = document.getElementById('channelsList');
    list.innerHTML = cachedChannels.map((ch, index) => {
        let iconHtml = ''; if (ch.iconData && ch.iconData.type === 'image') { iconHtml = `<img src="${ch.iconData.value}" style="width:${ch.iconData.size||24}px; height:${ch.iconData.size||24}px; object-fit:contain;">`; } else { iconHtml = `<i data-lucide="${(ch.iconData && ch.iconData.value) ? ch.iconData.value : ch.icon || 'star'}"></i>`; }
        return `<div class="bg-white p-4 rounded-xl border border-gray-100 flex items-center gap-4 group"><button onclick="openIconPickerForChannel(${index})" class="w-12 h-12 flex items-center justify-center bg-${ch.color || 'blue'}-100 text-${ch.color || 'blue'}-600 rounded-lg hover:bg-gray-200 transition-colors overflow-hidden">${iconHtml}</button><div class="flex-1"><input type="text" value="${ch.name}" class="font-bold text-gray-800 w-full bg-transparent mb-1 outline-none focus:border-b border-blue-500" onchange="updateChannel(${index}, 'name', this.value)"><input type="text" value="${ch.desc}" class="text-xs text-gray-400 w-full bg-transparent outline-none focus:border-b border-blue-500" onchange="updateChannel(${index}, 'desc', this.value)"><input type="text" value="${ch.url}" class="text-xs text-blue-400 w-full bg-transparent outline-none focus:border-b border-blue-500 mt-1" onchange="updateChannel(${index}, 'url', this.value)"></div><div class="opacity-0 group-hover:opacity-100 transition-opacity"><button onclick="removeChannel(${index})" class="text-red-500 p-2"><i data-lucide="trash-2" class="w-4 h-4"></i></button></div></div>`;
    }).join('');
    if(!document.getElementById('btnSaveChannels')) { const btn = document.createElement('button'); btn.id = 'btnSaveChannels'; btn.className = 'w-full bg-purple-600 text-white py-3 rounded-xl font-bold mt-4'; btn.innerText = 'حفظ التغييرات على القنوات'; btn.onclick = saveChannels; list.parentElement.appendChild(btn); } lucide.createIcons();
}
window.addChannel = () => { cachedChannels.push({ id: Date.now(), name: 'جديد', desc: 'وصف', url: '#', icon: 'star', color: 'gray' }); renderChannels(); };
window.updateChannel = (index, field, value) => { cachedChannels[index][field] = value; };
window.removeChannel = (index) => { if(!confirm('حذف؟')) return; cachedChannels.splice(index, 1); renderChannels(); };
window.saveChannels = async () => { const btn = document.getElementById('btnSaveChannels'); btn.innerText = 'جاري الحفظ...'; try { const dataToSave = cachedChannels.filter(x => x); await api.put('content/data/channels.json', JSON.stringify(dataToSave, null, 2), 'Update Channels', cachedChannels.sha); showToast('تم تحديث القنوات'); const file = await api.get('content/data/channels.json'); cachedChannels.sha = file.sha; } catch(e) { alert(e.message); } btn.innerText = 'حفظ التغييرات على القنوات'; };

// --- SETTINGS LOGIC ---
async function loadSettings() {
    const loader = document.getElementById('settingsLoader'); const form = document.getElementById('settingsForm'); 
    loader.classList.remove('hidden'); 
    form.classList.add('hidden');
    try {
        const file = await api.get('content/data/about.json'); 
        cachedAbout = JSON.parse(decodeURIComponent(escape(atob(file.content)))); 
        cachedAbout.sha = file.sha;
        
        document.getElementById('siteName').value = cachedAbout.siteName || "TechTouch";
        const cats = cachedAbout.categories?.labels || { articles: "اخبار", apps: "تطبيقات", games: "ألعاب", sports: "رياضة" };
        document.getElementById('catLabel_articles').value = cats.articles; document.getElementById('catLabel_apps').value = cats.apps; document.getElementById('catLabel_games').value = cats.games; document.getElementById('catLabel_sports').value = cats.sports;
        document.getElementById('catFontSize').value = cachedAbout.categories?.fontSize || 14; document.getElementById('catSizeVal').innerText = cachedAbout.categories?.fontSize || 14;
        document.getElementById('valName').value = cachedAbout.profileName;
        document.getElementById('previewProfile').src = cachedAbout.profileImage.startsWith('http') ? cachedAbout.profileImage : `../${cachedAbout.profileImage}`;
        document.getElementById('valProfileImg').value = cachedAbout.profileImage;
        document.getElementById('valBio').value = cachedAbout.bio;
        if (cachedAbout.ticker) {
            document.getElementById('tickerLabel').value = cachedAbout.ticker.label; document.getElementById('tickerText').value = cachedAbout.ticker.text; document.getElementById('tickerUrl').value = cachedAbout.ticker.url;
            document.getElementById('tickerSize').value = cachedAbout.ticker.fontSize || 14; document.getElementById('tickerSizeVal').innerText = cachedAbout.ticker.fontSize || 14;
            document.getElementById('tickerAnimated').checked = cachedAbout.ticker.animated !== false; 
        }
        document.getElementById('valBotInfo').value = cachedAbout.botInfo || ""; document.getElementById('valSearchInfo').value = cachedAbout.searchInfo || "";
        document.getElementById('valBotTitle').value = cachedAbout.botTitle || "مركز خدمة الطلبات (Bot)"; document.getElementById('valSearchTitle').value = cachedAbout.searchTitle || "دليل الوصول الذكي للمحتوى";
        const coverType = cachedAbout.coverType || 'color'; const rb = document.querySelector(`input[name="coverType"][value="${coverType}"]`); if(rb) rb.checked = true;
        if(coverType === 'color') document.getElementById('valCoverColor').value = cachedAbout.coverValue; else document.getElementById('valCoverImg').value = cachedAbout.coverValue; toggleCoverInput();
        document.getElementById('socFb').value = cachedAbout.social.facebook; document.getElementById('socInsta').value = cachedAbout.social.instagram; document.getElementById('socTikTok').value = cachedAbout.social.tiktok; document.getElementById('socYt').value = cachedAbout.social.youtube; document.getElementById('socTg').value = cachedAbout.social.telegram;
        const socialIcons = cachedAbout.socialIcons || {};
        ['facebook','instagram','tiktok','youtube','telegram'].forEach(key => {
            const btn = document.getElementById(`btnIcon_${key}`); let data = socialIcons[key]; if (!data || typeof data === 'string') data = { type: 'lucide', value: data || key, size: 24 };
            if(key === 'tiktok' && (!socialIcons[key] || socialIcons[key].value === 'video')) data.value = 'video'; 
            btn.dataset.iconInfo = JSON.stringify(data);
            if (data.type === 'image') btn.innerHTML = `<img src="${data.value}" style="width:24px; height:24px; object-fit:contain;">`; else { btn.innerHTML = `<i data-lucide="${data.value}"></i>`; }
        });
        lucide.createIcons(); 
    } catch(e) { 
        console.error(e); 
        alert("حدث خطأ أثناء تحميل الإعدادات. قد يكون الملف غير موجود أو تالف.\n" + e.message);
    } finally {
        loader.classList.add('hidden'); 
        form.classList.remove('hidden');
    }
}
window.toggleCoverInput = () => { 
    const type = document.querySelector('input[name="coverType"]:checked')?.value || 'color'; 
    const colorInput = document.getElementById('coverColorInput');
    const imgInput = document.getElementById('coverImageInput');
    
    // Safety check for null elements
    if (colorInput && imgInput) {
        if(type === 'color') { 
            colorInput.classList.remove('hidden'); 
            imgInput.classList.add('hidden'); 
        } else { 
            colorInput.classList.add('hidden'); 
            imgInput.classList.remove('hidden'); 
        } 
    }
};
window.saveSettingsData = async () => {
    const btn = document.getElementById('btnSaveSettings'); btn.innerText = 'جاري الحفظ...';
    try {
        const coverType = document.querySelector('input[name="coverType"]:checked').value;
        const getIconData = (key) => JSON.parse(document.getElementById(`btnIcon_${key}`).dataset.iconInfo || '{}');
        const newSettings = {
            profileName: document.getElementById('valName').value, profileImage: document.getElementById('valProfileImg').value, bio: document.getElementById('valBio').value,
            botInfo: document.getElementById('valBotInfo').value, searchInfo: document.getElementById('valSearchInfo').value, botTitle: document.getElementById('valBotTitle').value, searchTitle: document.getElementById('valSearchTitle').value,
            coverType: coverType, coverValue: coverType === 'color' ? document.getElementById('valCoverColor').value : document.getElementById('valCoverImg').value,
            siteName: document.getElementById('siteName').value,
            categories: { labels: { articles: document.getElementById('catLabel_articles').value, apps: document.getElementById('catLabel_apps').value, games: document.getElementById('catLabel_games').value, sports: document.getElementById('catLabel_sports').value }, fontSize: document.getElementById('catFontSize').value },
            ticker: { label: document.getElementById('tickerLabel').value, text: document.getElementById('tickerText').value, url: document.getElementById('tickerUrl').value, fontSize: document.getElementById('tickerSize').value, animated: document.getElementById('tickerAnimated').checked },
            social: { facebook: document.getElementById('socFb').value, instagram: document.getElementById('socInsta').value, tiktok: document.getElementById('socTikTok').value, youtube: document.getElementById('socYt').value, telegram: document.getElementById('socTg').value },
            socialIcons: { facebook: getIconData('facebook'), instagram: getIconData('instagram'), tiktok: getIconData('tiktok'), youtube: getIconData('youtube'), telegram: getIconData('telegram') }
        };
        await api.put('content/data/about.json', JSON.stringify(newSettings, null, 2), 'Update Settings', cachedAbout.sha); showToast('تم تحديث الإعدادات'); const file = await api.get('content/data/about.json'); cachedAbout.sha = file.sha;
    } catch(e) { alert(e.message); } btn.innerText = 'حفظ التغييرات';
};

window.toggleGithubSettings = () => document.getElementById('ghModal').classList.toggle('hidden');
window.saveGhSettings = () => { localStorage.setItem('gh_owner', document.getElementById('ghOwner').value.trim()); localStorage.setItem('gh_repo', document.getElementById('ghRepo').value.trim()); localStorage.setItem('gh_token', document.getElementById('ghToken').value.trim()); location.reload(); };

// --- Better Arabic Slug Generation ---
function arabicToLatin(str) { 
    if(!str) return '';
    const map = {
        'أ':'a','إ':'e','آ':'a','ا':'a','ب':'b','ت':'t','ث':'th','ج':'j','ح':'h','خ':'kh','د':'d','ذ':'th','ر':'r','ز':'z','س':'s','ش':'sh','ص':'s','ض':'d','ط':'t','ظ':'z','ع':'a','غ':'gh','ف':'f','ق':'q','ك':'k','ل':'l','م':'m','ن':'n','ه':'h','و':'w','ي':'y','ى':'a','ة':'h','ء':'a','ئ':'e','ؤ':'o',
        '٠':'0','١':'1','٢':'2','٣':'3','٤':'4','٥':'5','٦':'6','٧':'7','٨':'8','٩':'9',
        ' ': '-'
    }; 
    return str.split('').map(char => map[char] || char).join(''); 
}

window.autoSlug = () => { 
    const title = document.getElementById('pTitle').value; 
    if (document.getElementById('pSlug').dataset.mode === 'new') { 
        let slug = arabicToLatin(title).toLowerCase()
            .replace(/[^\w\s-]/g, '') // Remove non-word chars
            .replace(/\s+/g, '-') // Replace spaces with -
            .replace(/-+/g, '-'); // Remove duplicate -
        
        // Fallback if slug becomes empty
        if(slug.length < 2) slug = 'post-' + Date.now(); 
        
        document.getElementById('pSlug').value = slug.substring(0, 60); 
    } 
};

window.handleFileSelect = async (input, targetId, previewId = null) => { 
    if (input.files && input.files[0]) { 
        const btn = input.nextElementSibling; 
        const originalText = btn.innerText;
        btn.innerText = 'جاري الضغط...'; 
        btn.disabled = true; 
        try { 
            const url = await api.uploadImage(input.files[0]); 
            document.getElementById(targetId).value = url; 
            if(previewId) document.getElementById(previewId).src = '../' + url; 
        } catch(e) { 
            alert('Upload failed: ' + e.message); 
        } 
        btn.innerText = originalText; 
        btn.disabled = false; 
    } 
};
window.insertTag = (tag) => { const ta = document.getElementById('pContent'); const start = ta.selectionStart; const end = ta.selectionEnd; ta.value = ta.value.substring(0, start) + tag + ta.value.substring(end); ta.focus(); ta.selectionStart = ta.selectionEnd = start + tag.length; };
function showToast(msg) { const t = document.getElementById('toast'); document.getElementById('toastMsg').innerText = msg; t.classList.remove('translate-y-[-100%]', 'opacity-0'); setTimeout(() => t.classList.add('translate-y-[-100%]', 'opacity-0'), 3000); }
