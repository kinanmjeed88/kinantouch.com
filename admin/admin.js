
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
let iconPickerTarget = null;
const commonIcons = [
    // Social & Communication
    'facebook', 'instagram', 'twitter', 'linkedin', 'youtube', 'twitch', 'github', 'gitlab', 'video', 
    'message-circle', 'message-square', 'send', 'mail', 'phone', 'at-sign', 'hash', 'share-2',
    
    // Media & Content
    'image', 'camera', 'mic', 'headphones', 'play', 'pause', 'music', 'film', 'tv', 'radio',
    'file', 'file-text', 'folder', 'folder-plus',
    
    // UI & Navigation
    'home', 'user', 'settings', 'menu', 'x', 'search', 'bell', 'star', 'heart', 'thumbs-up', 
    'check', 'alert-circle', 'info', 'help-circle', 'plus', 'minus', 'trash', 'edit',
    'chevron-right', 'chevron-left', 'arrow-right', 'arrow-left', 'download', 'upload',
    
    // Tech & Devices
    'smartphone', 'monitor', 'cpu', 'hard-drive', 'wifi', 'bluetooth', 'battery', 'zap',
    'gamepad-2', 'joystick', 'mouse', 'keyboard', 'printer', 'server', 'database',
    
    // Misc
    'globe', 'map-pin', 'link', 'cloud', 'sun', 'moon', 'shopping-cart', 'credit-card', 
    'dollar-sign', 'gift', 'award', 'trophy', 'activity', 'calendar', 'clock'
];

document.addEventListener('DOMContentLoaded', () => {
    initIconPicker();
    if (!ghConfig.token) {
        document.getElementById('ghModal').classList.remove('hidden');
    } else {
        loadPosts();
    }
    
    document.addEventListener('click', function (e) {
        const editBtn = e.target.closest('.btn-edit');
        if (editBtn) {
            const index = editBtn.dataset.index;
            openEditByIndex(index);
            return;
        }
        const deleteBtn = e.target.closest('.btn-delete');
        if (deleteBtn) {
            const index = deleteBtn.dataset.index;
            deleteByIndex(index);
            return;
        }
    });
});

window.switchTab = (tabName) => {
    document.querySelectorAll('aside button').forEach(btn => btn.classList.remove('tab-active'));
    document.getElementById(`nav-${tabName}`).classList.add('tab-active');
    document.querySelectorAll('section').forEach(sec => sec.classList.add('hidden-section'));
    document.getElementById(`sec-${tabName}`).classList.remove('hidden-section');
    if (tabName === 'posts') loadPosts();
    if (tabName === 'channels') loadChannels();
    if (tabName === 'settings') loadSettings();
};

async function compressAndConvertToWebP(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 1200;
                const scaleSize = MAX_WIDTH / img.width;
                let width = img.width;
                let height = img.height;
                if (scaleSize < 1) {
                    width = MAX_WIDTH;
                    height = img.height * scaleSize;
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                const webpData = canvas.toDataURL('image/webp', 0.8);
                resolve(webpData.split(',')[1]); 
            };
            img.onerror = (error) => reject(error);
        };
        reader.onerror = (error) => reject(error);
    });
}

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
            const b64 = await compressAndConvertToWebP(file);
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
    if (url) { 
        let displayUrl = url.startsWith('http') ? url : url.replace(/^(\.\.\/)+/, '');
        displayUrl = '../' + displayUrl; 
        img.src = displayUrl; 
        img.classList.remove('hidden'); ph.classList.add('hidden'); const size = document.getElementById('pickerSize').value; img.style.width = size + 'px'; img.style.height = size + 'px'; 
    } else { img.classList.add('hidden'); ph.classList.remove('hidden'); }
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

async function loadPosts() {
    const list = document.getElementById('postsList'); const loader = document.getElementById('postsLoader');
    list.innerHTML = ''; loader.classList.remove('hidden');
    try {
        const files = await api.get('content/posts'); cachedPosts = [];
        const promises = files.map(async file => { 
            if (!file.name.endsWith('.json')) return; 
            try {
                const data = await api.get(file.path); 
                let decodedContent = '';
                try { decodedContent = decodeURIComponent(escape(atob(data.content))); } catch(e) { console.error("Decoding error for " + file.name, e); return; }
                const content = JSON.parse(decodedContent); 
                if (!content.slug) { content.slug = file.name.replace('.json', ''); }
                cachedPosts.push({ ...content, sha: data.sha, path: file.path }); 
            } catch (err) { console.error("Error loading post: " + file.name, err); }
        });
        await Promise.all(promises);
        cachedPosts.sort((a, b) => {
            const dateA = new Date(a.updated || a.date).getTime();
            const dateB = new Date(b.updated || b.date).getTime();
            if (isNaN(dateA)) return 1; if (isNaN(dateB)) return -1;
            return dateB - dateA;
        });
        loader.classList.add('hidden'); renderPosts();
    } catch (e) { console.error(e); loader.classList.add('hidden'); list.innerHTML = `<div class="text-center text-red-500">حدث خطأ في تحميل المقالات.<br>تأكد من إعدادات الاتصال.</div>`; }
}

function renderPosts() {
    const list = document.getElementById('postsList');
    if (!list) return;
    list.innerHTML = '';
    cachedPosts.forEach((p, index) => {
        let safeImage = p.image || '';
        if (safeImage && !safeImage.startsWith('http')) {
             safeImage = safeImage.replace(/^(\.\.\/)+/, '');
             safeImage = '../' + safeImage;
        } else if (!safeImage) {
            safeImage = 'https://via.placeholder.com/300x200?text=No+Image';
        }

        const dateDisplay = (p.updated && p.updated !== p.date) ? `<span class="text-blue-500 font-bold" title="تم التحديث">♻ ${p.updated}</span>` : `<span>${p.date || ''}</span>`;
        const card = document.createElement('div');
        card.className = 'bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center hover:shadow-md transition-all';
        card.innerHTML = `
            <div class="flex items-center gap-4">
                <img src="${safeImage}" class="w-16 h-10 object-cover rounded-md bg-gray-100">
                <div class="flex-1 min-w-0">
                    <h3 class="font-bold text-gray-800 line-clamp-1">${p.title || ''}</h3>
                    <div class="text-xs text-gray-400 flex gap-2 items-center">
                        ${dateDisplay} <span>•</span> <span class="bg-gray-100 px-2 py-0.5 rounded text-gray-600">${p.category || ''}</span>
                    </div>
                </div>
            </div>
            <div class="flex gap-2 shrink-0">
                <button class="btn-edit p-2 text-blue-600 hover:bg-blue-50 rounded-lg" data-index="${index}"><i data-lucide="edit-2" class="w-4 h-4"></i></button>
                <button class="btn-delete p-2 text-red-600 hover:bg-red-50 rounded-lg" data-index="${index}"><i data-lucide="trash" class="w-4 h-4"></i></button>
            </div>`;
        list.appendChild(card);
    });
    lucide.createIcons();
}

window.openPostEditor = () => { 
    document.getElementById('postEditor').classList.remove('hidden'); 
    ['pTitle', 'pSlug', 'pDesc', 'pContent', 'pImage', 'pYoutubeId'].forEach(id => { const el = document.getElementById(id); if(el) el.value = ''; }); 
    document.getElementById('pSlug').dataset.mode = 'new'; document.getElementById('pSlug').readOnly = false; document.getElementById('editorTitle').innerText = 'مقال جديد'; 
    document.getElementById('pDate').value = ''; // Reset date field for new posts
};
window.closePostEditor = () => document.getElementById('postEditor').classList.add('hidden');
window.openEditByIndex = (index) => {
    const p = cachedPosts[index]; if (!p) return alert('المقال غير موجود');
    const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };
    setVal('pTitle', p.title); setVal('pSlug', p.slug); setVal('pCat', p.category); setVal('pDesc', p.description); setVal('pContent', p.content); setVal('pImage', p.image); setVal('pYoutubeId', p.youtubeVideoId);
    setVal('pDate', p.date); // Populate date field
    const slugEl = document.getElementById('pSlug'); if(slugEl) { slugEl.readOnly = true; slugEl.dataset.mode = 'edit'; }
    document.getElementById('editorTitle').innerText = 'تعديل مقال'; document.getElementById('postEditor').classList.remove('hidden');
};
window.deleteByIndex = async (index) => {
    if (!confirm('هل أنت متأكد من الحذف؟')) return;
    const p = cachedPosts[index]; if (!p) return;
    try { await api.delete(p.path, p.sha, `Delete Post: ${p.slug}`); showToast('تم الحذف بنجاح'); loadPosts(); } catch (e) { alert(e.message); }
};
window.savePost = async () => {
    const btn = document.getElementById('btnSavePost'); btn.innerText = 'جاري الحفظ...'; btn.disabled = true;
    try {
        let slug = document.getElementById('pSlug').value.trim(); if (!slug) slug = 'post-' + Date.now();
        const isEdit = document.getElementById('pSlug').dataset.mode === 'edit'; 
        const existingPost = isEdit ? cachedPosts.find(p => p.slug === slug) : null; 
        const now = new Date().toISOString().split('T')[0];
        const getVal = (id) => { const el = document.getElementById(id); return el ? el.value : ''; };

        // =============================
        // Custom Publish Date Support
        // =============================

        let manualDate = document.getElementById('pDate')?.value;
        let finalDate;

        if (manualDate && manualDate.trim() !== '') {
            finalDate = manualDate;
        } else {
            const today = new Date();
            finalDate = today.toISOString().split('T')[0];
        }

        const postData = { title: getVal('pTitle'), slug: slug, description: getVal('pDesc'), category: getVal('pCat'), date: finalDate, updated: (isEdit) ? now : undefined, image: getVal('pImage'), content: getVal('pContent'), youtubeVideoId: getVal('pYoutubeId') };
        if(!postData.updated) delete postData.updated;
        await api.put(`content/posts/${slug}.json`, JSON.stringify(postData, null, 2), `Update Post: ${postData.title}`, existingPost ? existingPost.sha : null);
        showToast('تم حفظ المقال!'); closePostEditor(); loadPosts();
    } catch (e) { alert('خطأ في الحفظ: ' + e.message); } finally { btn.innerText = 'حفظ ونشر'; btn.disabled = false; }
};
window.insertYoutube = () => { const url = prompt("رابط يوتيوب:"); if (url) window.insertTag(`\n@[youtube](${url})\n`); };
window.insertLink = () => { const url = prompt("الرابط:"); const text = prompt("النص:"); if(url) window.insertTag(`[${text || 'اضغط هنا'}](${url})`); };

async function loadChannels() {
    const loader = document.getElementById('channelsLoader'); loader.classList.remove('hidden');
    try { const file = await api.get('content/data/channels.json'); cachedChannels = JSON.parse(decodeURIComponent(escape(atob(file.content)))); cachedChannels.sha = file.sha; renderChannels(); } catch(e) { console.error(e); } loader.classList.add('hidden');
}
function renderChannels() {
    const list = document.getElementById('channelsList');
    list.innerHTML = cachedChannels.map((ch, index) => {
        let iconHtml = ''; 
        if (ch.iconData && ch.iconData.type === 'image') { 
            let iUrl = ch.iconData.value;
            if(iUrl && !iUrl.startsWith('http')) iUrl = '../' + iUrl.replace(/^(\.\.\/)+/, '');
            iconHtml = `<img src="${iUrl}" style="width:${ch.iconData.size||24}px; height:${ch.iconData.size||24}px; object-fit:contain;">`; 
        } else { 
            iconHtml = `<i data-lucide="${(ch.iconData && ch.iconData.value) ? ch.iconData.value : ch.icon || 'star'}"></i>`; 
        }
        return `<div class="bg-white p-4 rounded-xl border border-gray-100 flex items-center gap-4 group"><button onclick="openIconPickerForChannel(${index})" class="w-12 h-12 flex items-center justify-center bg-${ch.color || 'blue'}-100 text-${ch.color || 'blue'}-600 rounded-lg hover:bg-gray-200 transition-colors overflow-hidden">${iconHtml}</button><div class="flex-1"><input type="text" value="${ch.name}" class="font-bold text-gray-800 w-full bg-transparent mb-1 outline-none focus:border-b border-blue-500" onchange="updateChannel(${index}, 'name', this.value)"><input type="text" value="${ch.desc}" class="text-xs text-gray-400 w-full bg-transparent outline-none focus:border-b border-blue-500" onchange="updateChannel(${index}, 'desc', this.value)"><input type="text" value="${ch.url}" class="text-xs text-blue-400 w-full bg-transparent outline-none focus:border-b border-blue-500 mt-1" onchange="updateChannel(${index}, 'url', this.value)"></div><div class="opacity-0 group-hover:opacity-100 transition-opacity"><button onclick="removeChannel(${index})" class="text-red-500 p-2"><i data-lucide="trash-2" class="w-4 h-4"></i></button></div></div>`;
    }).join('');
    if(!document.getElementById('btnSaveChannels')) { const btn = document.createElement('button'); btn.id = 'btnSaveChannels'; btn.className = 'w-full bg-purple-600 text-white py-3 rounded-xl font-bold mt-4'; btn.innerText = 'حفظ التغييرات على القنوات'; btn.onclick = saveChannels; list.parentElement.appendChild(btn); } lucide.createIcons();
}
window.addChannel = () => { cachedChannels.push({ id: Date.now(), name: 'جديد', desc: 'وصف', url: '#', icon: 'star', color: 'gray' }); renderChannels(); };
window.updateChannel = (index, field, value) => { cachedChannels[index][field] = value; };
window.removeChannel = (index) => { if(!confirm('حذف؟')) return; cachedChannels.splice(index, 1); renderChannels(); };
window.saveChannels = async () => { const btn = document.getElementById('btnSaveChannels'); btn.innerText = 'جاري الحفظ...'; try { const dataToSave = cachedChannels.filter(x => x); await api.put('content/data/channels.json', JSON.stringify(dataToSave, null, 2), 'Update Channels', cachedChannels.sha); showToast('تم تحديث القنوات'); const file = await api.get('content/data/channels.json'); cachedChannels.sha = file.sha; } catch(e) { alert(e.message); } btn.innerText = 'حفظ التغييرات على القنوات'; };

// New Function to Toggle Visual State
window.toggleTickerOpacity = () => {
    const enabled = document.getElementById('tickerEnabled').checked;
    const container = document.getElementById('tickerInputsContainer');
    if (enabled) {
        container.classList.remove('opacity-disabled');
    } else {
        container.classList.add('opacity-disabled');
    }
};

window.toggleTickerContent = () => {
    const type = document.querySelector('input[name="tickerType"]:checked')?.value || 'text';
    const textGroup = document.getElementById('tickerTextGroup');
    const imageGroup = document.getElementById('tickerImageGroup');
    
    if (type === 'text') {
        textGroup.classList.remove('hidden');
        imageGroup.classList.add('hidden');
    } else {
        textGroup.classList.add('hidden');
        imageGroup.classList.remove('hidden');
    }
};

async function loadSettings() {
    const loader = document.getElementById('settingsLoader'); const form = document.getElementById('settingsForm'); 
    loader.classList.remove('hidden'); form.classList.add('hidden');
    try {
        const file = await api.get('content/data/about.json'); cachedAbout = JSON.parse(decodeURIComponent(escape(atob(file.content)))); cachedAbout.sha = file.sha;
        
        const setVal = (id, val) => { const el = document.getElementById(id); if(el) el.value = val || ''; };
        setVal('siteName', cachedAbout.siteName || "TechTouch");
        setVal('valName', cachedAbout.profileName);
        setVal('valProfileImg', cachedAbout.profileImage);
        setVal('valBio', cachedAbout.bio);
        setVal('valLogoUrl', cachedAbout.logoUrl);

        const logoType = cachedAbout.logoType || 'text';
        const logoRb = document.querySelector(`input[name="logoType"][value="${logoType}"]`); 
        if(logoRb) logoRb.checked = true;
        toggleLogoInput();

        const cats = cachedAbout.categories?.labels || {};
        setVal('catLabel_articles', cats.articles || "اخبار");
        setVal('catLabel_apps', cats.apps || "تطبيقات");
        setVal('catLabel_games', cats.games || "ألعاب");
        setVal('catLabel_sports', cats.sports || "رياضة");
        
        const fonts = cachedAbout.globalFonts || { nav: 12, content: 13, titles: 14, mainTitles: 15 };
        const setFont = (id, val, displayId) => { const el = document.getElementById(id); const disp = document.getElementById(displayId); if(el) { el.value = val; } if(disp) { disp.innerText = val; } };
        setFont('fontSize_nav', fonts.nav || 12, 'f_nav_val');
        setFont('fontSize_content', fonts.content || 13, 'f_content_val');
        setFont('fontSize_titles', fonts.titles || 14, 'f_titles_val');
        setFont('fontSize_main', fonts.mainTitles || 15, 'f_main_val');

        let profileSrc = cachedAbout.profileImage;
        if (profileSrc && !profileSrc.startsWith('http')) { profileSrc = profileSrc.replace(/^(\.\.\/)+/, ''); profileSrc = '../' + profileSrc; }
        const previewEl = document.getElementById('previewProfile'); if(previewEl) previewEl.src = profileSrc || '../assets/images/me.jpg';
        
        if (cachedAbout.ticker) {
            setVal('tickerLabel', cachedAbout.ticker.label);
            setVal('tickerText', cachedAbout.ticker.text);
            setVal('tickerUrl', cachedAbout.ticker.url);
            setVal('tickerImageUrl', cachedAbout.ticker.imageUrl);
            setFont('tickerSize', cachedAbout.ticker.fontSize || 14, 'tickerSizeVal');
            
            const tickCheck = document.getElementById('tickerAnimated');
            if(tickCheck) tickCheck.checked = cachedAbout.ticker.animated !== false;
            
            const enabledCheck = document.getElementById('tickerEnabled');
            const isEnabled = cachedAbout.ticker.enabled !== false; 
            if(enabledCheck) enabledCheck.checked = isEnabled;
            
            // Set Content Type
            const tickerType = cachedAbout.ticker.type || 'text';
            const typeRb = document.querySelector(`input[name="tickerType"][value="${tickerType}"]`);
            if(typeRb) typeRb.checked = true;

            toggleTickerOpacity(); 
            toggleTickerContent();
        }

        setVal('valBotInfo', cachedAbout.botInfo || "");
        setVal('valSearchInfo', cachedAbout.searchInfo || "");
        setVal('valBotTitle', cachedAbout.botTitle || "مركز خدمة الطلبات (Bot)");
        setVal('valSearchTitle', cachedAbout.searchTitle || "دليل الوصول الذكي للمحتوى");
        
        const coverType = cachedAbout.coverType || 'color';
        const coverRb = document.querySelector(`input[name="coverType"][value="${coverType}"]`);
        if(coverRb) coverRb.checked = true;
        if(coverType === 'color') setVal('valCoverColor', cachedAbout.coverValue);
        else setVal('valCoverImg', cachedAbout.coverValue);
        toggleCoverInput();

        const social = cachedAbout.social || {};
        setVal('socFb', social.facebook);
        setVal('socInsta', social.instagram);
        setVal('socTikTok', social.tiktok);
        setVal('socYt', social.youtube);
        setVal('socTg', social.telegram);

        const socialIcons = cachedAbout.socialIcons || {};
        ['facebook','instagram','tiktok','youtube','telegram'].forEach(key => {
            const btn = document.getElementById(`btnIcon_${key}`);
            if(!btn) return;
            let data = socialIcons[key]; 
            if (!data || typeof data === 'string') data = { type: 'lucide', value: data || key, size: 24 };
            if(key === 'tiktok' && (!socialIcons[key] || socialIcons[key].value === 'video')) data.value = 'video'; 
            btn.dataset.iconInfo = JSON.stringify(data);
            if (data.type === 'image') {
                let sUrl = data.value;
                if(sUrl && !sUrl.startsWith('http')) sUrl = '../' + sUrl.replace(/^(\.\.\/)+/, '');
                btn.innerHTML = `<img src="${sUrl}" style="width:24px; height:24px; object-fit:contain;">`; 
            } else { btn.innerHTML = `<i data-lucide="${data.value}"></i>`; }
        });
        
        lucide.createIcons(); 
    } catch(e) { console.error(e); alert("خطأ في تحميل الإعدادات: " + e.message); } finally { loader.classList.add('hidden'); form.classList.remove('hidden'); }
}

window.toggleCoverInput = () => { 
    const type = document.querySelector('input[name="coverType"]:checked')?.value || 'color'; 
    const colorInput = document.getElementById('coverColorInput'); const imgInput = document.getElementById('coverImageInput'); 
    if (colorInput && imgInput) { if(type === 'color') { colorInput.classList.remove('hidden'); imgInput.classList.add('hidden'); } else { colorInput.classList.add('hidden'); imgInput.classList.remove('hidden'); } } 
};

window.toggleLogoInput = () => { 
    const type = document.querySelector('input[name="logoType"]:checked')?.value || 'text'; 
    const logoInput = document.getElementById('logoImageInput'); const siteNameInput = document.getElementById('siteName');
    if (type === 'image') { if(logoInput) logoInput.classList.remove('hidden'); if(siteNameInput) siteNameInput.classList.add('opacity-50'); } else { if(logoInput) logoInput.classList.add('hidden'); if(siteNameInput) siteNameInput.classList.remove('opacity-50'); } 
};

window.saveSettingsData = async () => {
    const btn = document.getElementById('btnSaveSettings'); btn.innerText = 'جاري الحفظ...';
    try {
        const coverType = document.querySelector('input[name="coverType"]:checked').value;
        const logoType = document.querySelector('input[name="logoType"]:checked').value;
        const tickerType = document.querySelector('input[name="tickerType"]:checked').value;
        const getIconData = (key) => { const el = document.getElementById(`btnIcon_${key}`); return el ? JSON.parse(el.dataset.iconInfo || '{}') : {}; };
        
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
            siteName: document.getElementById('siteName').value,
            logoType: logoType, 
            logoUrl: document.getElementById('valLogoUrl').value,
            categories: { labels: { articles: document.getElementById('catLabel_articles').value, apps: document.getElementById('catLabel_apps').value, games: document.getElementById('catLabel_games').value, sports: document.getElementById('catLabel_sports').value } },
            globalFonts: { nav: parseInt(document.getElementById('fontSize_nav').value) || 12, content: parseInt(document.getElementById('fontSize_content').value) || 13, titles: parseInt(document.getElementById('fontSize_titles').value) || 14, mainTitles: parseInt(document.getElementById('fontSize_main').value) || 15 },
            ticker: { 
                label: document.getElementById('tickerLabel').value, 
                text: document.getElementById('tickerText').value, 
                url: document.getElementById('tickerUrl').value, 
                type: tickerType,
                imageUrl: document.getElementById('tickerImageUrl').value,
                fontSize: parseInt(document.getElementById('tickerSize').value) || 14, 
                animated: document.getElementById('tickerAnimated').checked,
                enabled: document.getElementById('tickerEnabled').checked
            },
            social: { facebook: document.getElementById('socFb').value, instagram: document.getElementById('socInsta').value, tiktok: document.getElementById('socTikTok').value, youtube: document.getElementById('socYt').value, telegram: document.getElementById('socTg').value },
            socialIcons: { facebook: getIconData('facebook'), instagram: getIconData('instagram'), tiktok: getIconData('tiktok'), youtube: getIconData('youtube'), telegram: getIconData('telegram') }
        };
        await api.put('content/data/about.json', JSON.stringify(newSettings, null, 2), 'Update Settings', cachedAbout.sha); 
        showToast('تم تحديث الإعدادات'); 
        const file = await api.get('content/data/about.json'); cachedAbout.sha = file.sha;
    } catch(e) { alert(e.message); } 
    btn.innerText = 'حفظ التغييرات';
};

window.toggleGithubSettings = () => document.getElementById('ghModal').classList.toggle('hidden');
window.saveGhSettings = () => { localStorage.setItem('gh_owner', document.getElementById('ghOwner').value.trim()); localStorage.setItem('gh_repo', document.getElementById('ghRepo').value.trim()); localStorage.setItem('gh_token', document.getElementById('ghToken').value.trim()); location.reload(); };

function arabicToLatin(str) { if(!str) return ''; const map = { 'أ':'a','إ':'e','آ':'a','ا':'a','ب':'b','ت':'t','ث':'th','ج':'j','ح':'h','خ':'kh','د':'d','ذ':'th','ر':'r','ز':'z','س':'s','ش':'sh','ص':'s','ض':'d','ط':'t','ظ':'z','ع':'a','غ':'gh','ف':'f','ق':'q','ك':'k','ل':'l','م':'m','ن':'n','ه':'h','و':'w','ي':'y','ى':'a','ة':'h','ء':'a','ئ':'e','ؤ':'o', '٠':'0','١':'1','٢':'2','٣':'3','٤':'4','٥':'5','٦':'6','٧':'7','٨':'8','٩':'9', ' ': '-' }; return str.split('').map(char => map[char] || char).join(''); }
window.autoSlug = () => { const title = document.getElementById('pTitle').value; if (document.getElementById('pSlug').dataset.mode === 'new') { let slug = arabicToLatin(title).toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-'); if(slug.length < 2) slug = 'post-' + Date.now(); document.getElementById('pSlug').value = slug.substring(0, 20); } };
window.handleFileSelect = async (input, targetId, previewId = null) => { if (input.files && input.files[0]) { const btn = input.nextElementSibling; const originalText = btn.innerText; btn.innerText = 'جاري الضغط...'; btn.disabled = true; try { const url = await api.uploadImage(input.files[0]); document.getElementById(targetId).value = url; if(previewId) { let pUrl = url.startsWith('http') ? url : '../' + url; document.getElementById(previewId).src = pUrl; } } catch(e) { alert('Upload failed: ' + e.message); } btn.innerText = originalText; btn.disabled = false; } };
window.insertTag = (tag) => { const ta = document.getElementById('pContent'); const start = ta.selectionStart; const end = ta.selectionEnd; ta.value = ta.value.substring(0, start) + tag + ta.value.substring(end); ta.focus(); ta.selectionStart = ta.selectionEnd = start + tag.length; };
function showToast(msg) { const t = document.getElementById('toast'); document.getElementById('toastMsg').innerText = msg; t.classList.remove('translate-y-[-100%]', 'opacity-0'); setTimeout(() => t.classList.add('translate-y-[-100%]', 'opacity-0'), 3000); }