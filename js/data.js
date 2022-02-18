// check jika browser mendukung local storage
const checkForStorage = () => {
    return typeof Storage !== "undefined"
}

// mengambil books di local storage (collections, reads, table atau box)
const getBooks = (storageKey) => {
    if (checkForStorage()) {
        // parse data yang didapat ke object JSON jika item dari storageKey ditemukan
        return JSON.parse(localStorage.getItem(storageKey)) || [];
    }

    // mengembalikan empty array jika browser tidak mendukung local storage dan storageKey tidak ditemukan
    return [];
}

// memasukkan/merubah isi local storage (collections, reads, table atau box)
const setBooks = (storageKey, data) => {
    if (checkForStorage()) {
        // konversi data ke string JSON
        localStorage.setItem(storageKey, JSON.stringify(data));
    }
}

// mengambil semua books pada local storage (collections, reads, table atau box)
const load = (storageKey, elem, render) => {
    let storage = [];

    // storageKey ditemukan dan memiliki isi
    if (localStorage.getItem(storageKey) !== null || localStorage.getItem(storageKey) !== null && localStorage.getItem(storageKey).length > 0)  {
        // ambil books sesuai dengan isi storageKey di local storage
        storage = getBooks(storageKey);
        
        // jika render true
        if (render) {
            // hapus default books pada elemen (collection, read, table, box)
            elem.innerHTML = "";
            // dan render dengan data dari local storage
            renderBooks(storage, elem);
            return true;
        } else {
            // jika false maka kembalikan saja dalam bentuk JSON
            return storage;
        }
    }

    // mengembalikan nilai empty array jika storageKey tidak ditemukan
    return storage;
}

// load books ke collection
const loadCollections = (render = true) => {
    return load('collections', bookAtCollection, render);
}

// load books ke read
const loadReads = (render = true) => {
    return load('reads', bookAtRead, render);
}

// load books ke table
const loadTable = (render = true) => {
    return load('table', bookAtTable, render);
}

// load books ke box
const loadBooksAtBox = (render = true) => {
    return load('box', bookAtBox, render);
}

// proses render books
const renderBooks = (books, container, sortBy = 'time', sortType = 'asc') => {
    // jika books tidak ada, maka render tidak dieksekusi
    if (books.length < 1) {
        return false;
    }

    // proses mengurutkan books dan defaultnya adalah asc dan filter time
    if (sortBy) {
        sortBy = (sortBy === 'time') ? 'id' : sortBy;
        sortBy = (sortType === 'desc') ? sortBy : `-${sortBy}`;

        // sorting dengan custom sort
        books.sort(dynamicSort(sortBy));
    }

    // books di loop
    books.forEach(book => {
        const id = book.id;
        const title = book.title;
        const author = book.author;
        const year = book.year;
        const bookCover = book.bookCover;
        const isComplete = book.isComplete;
        // jika book sudah dibaca, maka book nantinya diberi attr data
        // memberitahukan book tersebut berasal dari mana
        const bookFrom = isComplete ? 'book-at-read' : 'book-at-collection';

        const newBook = (`
            <div data-id="${id}" class="book-cover" draggable="true" style="background: linear-gradient(${bookCover})" data-book-from="${bookFrom}">
                <div class="book-info">
                    <span class="title">${title}</span>
                    <span class="author">${author}</span>
                    <span class="year">${year}</span>
                </div>
            </div>
        `);

        // memasukkan book kedalam collection, read, table atau box
        container.innerHTML += newBook;
    });
}

// koleksi book cover
const bookCovers = () => {
    const randomCover = {
        0: "135deg, #D68FD1 0%, #F70AF5 100%",
        1: "135deg, #FFF886 0%, #F072B6 100%",
        2: "135deg, #FFA8A8 0%, #FCFF00 100%",
        3: "135deg, #B226EA 0%, #FEB8C4 100%",
        4: "135deg, #F0FF00 0%, #58CFFB 100%",
        5: "135deg, #EFD4F2 0%, #297FCE 100%",
        6: "135deg, #FFF6B7 0%, #F6416C 100%",
        7: "135deg, #9B3F6C 0%, #D9ACAE 100%",
        8: "135deg, #FFF3B0 0%, #CA26FF 100%",
        9: "135deg, #EE9AE5 0%, #5961F9 100%"
    }

    return randomCover;
}

// mencari index dari book yang berada di semua storage
const findIndexBookIdFromAllStorage = (dropTo, id, findInItSelf = false) => {
    // menampung semua books berdasarkan index yang sesuai dnegan storageKey
    const allStorage = {
        collections: loadCollections(false),
        reads: loadReads(false),
        table: loadTable(false),
        box: loadBooksAtBox(false)
    };

    // loop semua storage ke dalam storageKey
    for (let storageKey in allStorage) {
        // tampung storage berdasarkan storageKey
        const storage = allStorage[storageKey];

        /*
            e.g. jika findInItSelf = true, storageKey = box, dropTo = box
            maka index book yang ingin dicari akan dicari didalam storageKey itu sendiri
            bukan dicari di storage lain. contoh kasus ketika menghapus salah satu book
            pada box, ia akan mencari index dari book yang ingin dihapus di storage box
            dan tidak mencarinya di storage lain karena memang dari box yang akan dihapus

            tetapi
            e.g. anggaplah loop saat ini adalah collections
            dik: findInItSelf = false, storageKey = collections, dropTo = reads
            jika findInItSelf = false, storageKey != dropTo
            maka index book yang ingin dicari akan dicari didalam storageKey lain.
            contoh kasus ketika menambahkan book pada reads, ia akan mencari index dari
            book yang ingin ditambahkan di storage lain
        */
        if (findInItSelf && storageKey == dropTo && storage.length > 0 || !findInItSelf &&  storage.length > 0 && storageKey !== dropTo) {
            // mencari index dari book yang ingin dicari
            const index = storage.findIndex(book => book.id === id);
            
            // jika index ditemukan,
            if (index > -1) {
                // maka return array
                return [storage, storageKey, index];
            }
        }
    }

    return [];
}

const moveBookToAnotherDragOver = (moveTo, moveBookId, dropTo, disComplete) => {
    // mencari index dari book yang ingin dipindahkan
    const storageAndIndexKey = findIndexBookIdFromAllStorage(dropTo, moveBookId);

    if (storageAndIndexKey.length > 0) {
        const moveFrom = storageAndIndexKey[0];
        const dropFrom = storageAndIndexKey[1];
        const indexKey = storageAndIndexKey[2];
        // mengambil object book
        const book = moveFrom[indexKey];

        // jika disComplete berisi true (hanya collection dan read yang dapat mengeksekusi)
        if (disComplete) {
            // maka ubah isi isComplete, jika dropTo = read, maka isComplete = true
            // yang berarti book sudah dibaca
            const isComplete = dropTo == 'collections' ? false : true;
            book.isComplete = isComplete;
        }
        
        // menambahkan book ke storage tujuan
        moveTo.push(book);
        // menghapus book dari storage semula
        moveFrom.splice(indexKey, 1);
        
        // memperbaharui nilai storage
        setBooks(dropTo, moveTo);
        setBooks(dropFrom, moveFrom);
        return true;
    }

    return false;
}

function dynamicSort(property) {
    let sortOrder = 1;

    // jika property berawalan -, maka sortOrder = -1 yang berarti descending
    if(property[0] === "-") {
        sortOrder = -1;
        property = property.substr(1);
    }
    return function (a,b) {
        const result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
        return result * sortOrder;
    }
}