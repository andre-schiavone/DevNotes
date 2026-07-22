const searchInput = document.querySelector("#search-input");
const noteInput = document.querySelector("#notes-input");
const notes = document.querySelector(".notes");
const settingsContainer = document.querySelector(".settings-container");
const container = document.querySelector(".container");
const columnSelect = document.querySelector("#columns");
const fontSizeInput = document.querySelector("#font-size");
const fontValue = document.querySelector("#font-value");
const preview = document.querySelector(".preview .notes");


const applySettings = (settings) => {
    
    const columns = parseInt(settings.columns);

    notes.classList.remove("one-column", "two-columns");
    preview.classList.remove("one-column", "two-columns");

    if(columns == 2){
        notes.classList.add("two-columns");
        preview.classList.add("two-columns");

    } else{
        notes.classList.add("one-column");
        preview.classList.add("one-column");
    }

    const size = settings.fontSize;

    fontValue.textContent = `${size}px`;

    document.documentElement.style.setProperty(
        "--note-font-size",
        `${size}px`
    );
    
}

const updateSettings = () => {

    applySettings({
        columns: columnSelect.value,
        fontSize: fontSizeInput.value
    });

    saveSettings();
}

columnSelect.addEventListener("change", updateSettings);
fontSizeInput.addEventListener("input", updateSettings);

const saveSettings = () => {
    const settings = {
        columns: columnSelect.value,
        fontSize: fontSizeInput.value
    };

    localStorage.setItem("settings", JSON.stringify(settings));
}

const loadSettings = () => {
    const settings = 
        JSON.parse(localStorage.getItem("settings")) || {
            columns: 1,
            fontSize: 18
        };

    columnSelect.value = settings.columns;
    fontSizeInput.value = settings.fontSize;

    applySettings(settings);
}

if(preview){
    preview.innerHTML = `
        <div class="note">
            <textarea class="note-text">just a dummy note</textarea>
            <button class="pin-btn" aria-label="Pin note"><i class="bi bi-pin-angle-fill"></i></button>
            <div class="hover-buttons">
                <button class="remove-btn" aria-label="Remove note"><i class="bi bi-x-circle"></i></button>
                <button class="copy-btn" aria-label="Copy to clipboard"><i class="bi bi-clipboard"></i></button>
            </div>
        </div>
        <div class="note">
            <textarea class="note-text">just a veeeeeeeeeeeeee
            eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
            eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
            eeeeeeeeeeeeeeeeeeeeeery long dummy note</textarea>
            <button class="pin-btn" aria-label="Pin note"><i class="bi bi-pin-angle-fill"></i></button>
            <div class="hover-buttons">
                <button class="remove-btn" aria-label="Remove note"><i class="bi bi-x-circle"></i></button>
                <button class="copy-btn" aria-label="Copy to clipboard"><i class="bi bi-clipboard"></i></button>
            </div>
        </div>
    `;

    preview.classList.add("one-column");
}

const createNote = (text, pinned = false) =>{

    const note = document.createElement("div");

    note.classList.add("note");

    if(pinned){
        note.classList.add("pinned");
    }

    note.innerHTML = `
        <textarea class="note-text">${text}</textarea>
        <button class="pin-btn" aria-label="Pin note"><i class="bi bi-pin-angle-fill"></i></button>
        <div class="hover-buttons">
            <button class="remove-btn" aria-label="Remove note"><i class="bi bi-x-circle"></i></button>
            <button class="copy-btn" aria-label="Copy to clipboard"><i class="bi bi-clipboard"></i></button>
        </div>
    `;

    notes.appendChild(note);
}

const saveNotes = () =>{
    const myNotes = [];

    notes.querySelectorAll(".note").forEach(note => {

        myNotes.push({
            text: note.querySelector(".note-text").value,
            pinned: note.classList.contains("pinned")
        });

    });

    localStorage.setItem("notes", JSON.stringify(myNotes));
}

const loadNotes = () => {

    const savedNotes = JSON.parse(localStorage.getItem("notes")) || [];

    savedNotes.forEach(note => {
        createNote(note.text, note.pinned);
    });

}

const escapeCSV = (text) => {
    return `"${String(text).replaceAll('"', '""')}"`; //Só para garantir que não quebre com virgula "", aspas (replaceAll), undefined e null (String);
}

const exportData = () => {
    const notes = JSON.parse(localStorage.getItem("notes")) || [];

    let csv = "\ufeffTexto,Fixado\n"; //evitar caracteres quebrados (BOM)

    notes.forEach(note => {
        csv += `${escapeCSV(note.text)},${note.pinned}\n`
    });

    const element = document.createElement("a");

    element.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);

    element.download = "notes.csv"

    element.click();
}

noteInput.addEventListener("keydown", (e) => {
    if(e.key === "Enter"){
        createNote(noteInput.value);
        saveNotes();
        noteInput.value = "";
    }
})

document.addEventListener("click", (e)=>{
    if(e.target.closest(".add-btn")){
        createNote(noteInput.value);
        saveNotes();
        noteInput.value = "";
    }
    
    if(e.target.closest(".remove-btn")){
        e.target.closest(".note").remove();
        saveNotes();
    }

    if(e.target.closest(".copy-btn")){
        const note = e.target.closest(".note");

        const textarea = note.querySelector(".note-text");

        navigator.clipboard.writeText(textarea.value);
    }

    if(e.target.closest(".pin-btn")){
        const note = e.target.closest(".note");

        note.classList.toggle("pinned");

        if (note.classList.contains("pinned")) {
            notes.prepend(note);
        } 

        saveNotes();
    }

    if(e.target.closest(".export-btn")){
        exportData();
    }

    if(e.target.closest(".settings")){
        settingsContainer.style.display = "flex";
        container.style.display = "none";
    }

    if(e.target.closest(".return")){
        settingsContainer.style.display = "none";
        container.style.display = "";
    }

})


document.addEventListener("input", (e) => {

    if(e.target.classList.contains("note-text")){
        saveNotes();
    }

    if(e.target === searchInput){
        const search = searchInput.value.toLowerCase().trim();
        const myNotes = notes.querySelectorAll(".note");

        if (!search) {
            myNotes.forEach(note =>{
                note.style.display = "";
            });
            return;
        }

        myNotes.forEach((note) => {
            const text = note.querySelector(".note-text").value.toLowerCase();
            note.style.display = text.includes(search) ? "" : "none";
        });
    }

})

loadSettings();
loadNotes();