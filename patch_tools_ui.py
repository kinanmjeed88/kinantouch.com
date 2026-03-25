import re

def update_ui(filepath):
    with open(filepath, "r") as f:
        content = f.read()

    # Find where the title/brand is rendered in tools-phones
    # Currently it sets innerText to displayName
    # Let's see how it sets it: `displayName.innerText = phone.name;`
    # We will inject the image element into the DOM if it exists.
    
    # We'll just replace the innerHTML assignment of the specsGrid or similar
    # In tools-phones.html:
    if filepath == "tools-phones.html":
        # Look for the title rendering
        old_title = "displayBrand.innerText = phoneObj.brand;\n            displayName.innerText = phoneObj.name;"
        new_title = """
            displayBrand.innerText = phoneObj.brand;
            displayName.innerText = phoneObj.name;
            
            // Image handling
            let imgContainer = document.getElementById('phoneImageContainer');
            if(!imgContainer) {
                imgContainer = document.createElement('div');
                imgContainer.id = 'phoneImageContainer';
                imgContainer.className = 'w-32 h-32 md:w-40 md:h-40 shrink-0 mx-auto bg-white rounded-2xl border border-gray-100 flex items-center justify-center overflow-hidden mb-4';
                specsCard.insertBefore(imgContainer, specsCard.firstChild);
            }
            if (phoneObj.image) {
                imgContainer.innerHTML = `<img src="${phoneObj.image}" alt="${phoneObj.name}" class="max-w-full max-h-full object-contain p-2" onerror="this.src='assets/images/me.jpg'">`;
                imgContainer.style.display = 'flex';
            } else {
                imgContainer.style.display = 'none';
            }
"""
        content = content.replace(old_title, new_title)

    # In tools-compare.html, it probably renders two columns.
    # Look for the card rendering loop
    if filepath == "tools-compare.html":
        old_col = """            const nameEl = document.getElementById(`name${index}`);
            brandEl.innerText = p.brand;
            nameEl.innerText = p.name;"""
        
        new_col = """            const nameEl = document.getElementById(`name${index}`);
            brandEl.innerText = p.brand;
            nameEl.innerText = p.name;
            
            let imgContainer = document.getElementById(`imgContainer${index}`);
            if(!imgContainer) {
                imgContainer = document.createElement('div');
                imgContainer.id = `imgContainer${index}`;
                imgContainer.className = 'w-24 h-24 sm:w-32 sm:h-32 mx-auto bg-white rounded-2xl border border-gray-100 flex items-center justify-center overflow-hidden mb-4';
                const headerBox = brandEl.parentElement;
                headerBox.insertBefore(imgContainer, headerBox.firstChild);
            }
            if(p.image) {
                imgContainer.innerHTML = `<img src="${p.image}" alt="${p.name}" class="max-w-full max-h-full object-contain p-2" onerror="this.src='assets/images/me.jpg'">`;
                imgContainer.style.display = 'flex';
            } else {
                imgContainer.style.display = 'none';
            }
"""
        content = content.replace(old_col, new_col)

    with open(filepath, "w") as f:
        f.write(content)

update_ui("tools-phones.html")
update_ui("tools-compare.html")
