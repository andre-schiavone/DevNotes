const searchInput = document.querySelector("#search-input");
const exportBtn = document.querySelector(".export-btn");
const noteInput = document.querySelector("#notes-input");
const addBtn = document.querySelector(".add-btn");
const notes = document.querySelector(".notes");

const createNote = (text, pinned = false) =>{

    const note = document.createElement("div");

    note.classList.add("note");

    if(pinned){
        note.classList.add("pinned");
    }

    note.innerHTML = `
        <textarea class="note-text">${text}</textarea>
        <button class="pin-btn"><i class="bi bi-pin-angle-fill"></i></button>
        <div class="hover-buttons">
            <button class="remove-btn"><i class="bi bi-x-circle"></i></button>
            <button class="copy-btn"><i class="bi bi-clipboard"></i></button>
        </div>
    `;

    notes.appendChild(note);
}

const saveNotes = () =>{
    const myNotes = [];

    document.querySelectorAll(".note").forEach(note => {

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

    element.href = "data:text/csv;charset=utf-8," + encodeURI(csv);

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


loadNotes();