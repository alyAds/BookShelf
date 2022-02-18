// global variable
const bookAtTable = document.querySelector(".book-at-table");
const bookAtCollection = document.querySelector(".book-at-collection");
const bookAtRead = document.querySelector(".book-at-read");
const bookAtBox = document.querySelector(".book-at-box");
const toast = document.querySelector(".toast");

const readAction = document.getElementById("read-action");
const recycleBtn = document.getElementById("recycle");
const returnBtn = document.getElementById("kembalikan");

// inisialisasi koleksi book cover
const bookCoversInStorage = bookCovers();
let toastForBox = false;

window.addEventListener('load', function() {
    if (checkForStorage()) {
        /*
            cek apakah browser mendukung local storage
            jika iya, maka contoh buku akan dihapus
            lalu di render ulang dengan data yang baru dari local storage
            dengan fungsi dibawah ini :
            - loadCollections();
            - loadReads();
            - loadTable();
            - loadBooksAtBox();
        */

        bookAtCollection.innerHTML = "";
        bookAtRead.innerHTML = "";
        bookAtBox.innerHTML = "";
        bookAtTable.innerHTML = "";
        
        // render buku
        loadCollections();
        loadReads();
        loadTable();
        loadBooksAtBox();

        // update jumlah buku yang dirender ulang
        updateCountBook();

        // jika buku pada table kosong, maka tombol kembalikan akan disabled
        if (bookAtTable.children.length == 0) {
            disableButton(recycleBtn, returnBtn, readAction, "disable");
        }

        // mengubah teks tombol utama pada table berdasarkan status buku
        changeReadActionText(readAction);
    } else {
        return hideToast(toastForBox, toast, "Browser Anda tidak mendukung local storage (penyimpanan lokal)")
    }
})

document.addEventListener("DOMContentLoaded", function(event) {
    // inisialisasi element yg dibutuhkan

    const allDropBook = document.querySelectorAll(".drop-book");
    const sorts = document.querySelectorAll(".sort");
    const inputs = document.querySelectorAll("#form-add-collection input")
    
    const cancel = document.getElementById("cancel");
    const cancelOrAdd = document.getElementById("cancel-or-add");
    const form = document.getElementById("form-add-collection");
    const btnDeleteBooksAtBox = document.getElementById("delete-books-at-box");

    const overlay = document.querySelector(".overlay");
    const deleteBookBtn = document.querySelector(".delete-book-btn");

    let clickedCancelOrAdd = false;
    let toastForBookAction = false;

    // proses penginputan buku
    inputs.forEach(input => {
        // ketika input diklik, maka input akan menjadi focus
        input.addEventListener("focus", () => {
            input.parentElement.classList.add("active");
            input.parentElement.children[0].style.transform = "translate(0, 0)";
            input.parentElement.children[0].style.color = "#000";
        })

        // ketika input sedang diketik
        input.addEventListener("input", (event) => {
            const value = event.target.value;

            // input title dan author bertype text yang memiliki rule yang sama
            if (input.getAttribute("type") == "text") {
                if (value.length < 3 || value.length > 32) {
                    // jika inputan kurang dari 3 karakter atau lebih dari 32 karakter maka teks berwarna merah
                    input.parentElement.children[0].style.color = "#f00";
                } else {
                    // jika rule terpenuhi maka teks berwarna hitam kembali
                    input.parentElement.children[0].style.color = "#000";
                }
            } else {
                // input year bertype number hanya memiliki 1 rule yaitu
                if (value.length != 4) {
                    // jika apabila inputan tidak 4 digit maka teks berwarna merah
                    input.parentElement.children[0].style.color = "#f00";
                } else {
                    // jika rule terpenuhi maka teks berwarna hitam kembali
                    input.parentElement.children[0].style.color = "#000";
                }
            }
        })

        // ketika input di lepas
        input.addEventListener("blur", () => {
            // jika inputan kosong maka kembali seperti keadaan semula
            if (input.value == "") {
                input.parentElement.classList.toggle("active");
                input.parentElement.children[0].removeAttribute("style");
            }
        })
    })

    // proses penambahan buku
    form.addEventListener("submit", event => {
        event.preventDefault();
        
        // mengambil data dari form
        const bookTitle = document.getElementById("book-title");
        const bookAuthor = document.getElementById("author");
        const bookYear = document.getElementById("year");
        
        const bookTitleVal = bookTitle.value;
        const bookAuthorVal = bookAuthor.value;
        const bookYearVal = bookYear.value;

        // check apakah semua input sudah diisi
        if (bookTitleVal == "" || bookAuthorVal == "" || bookYearVal == "") {
            return hideToast(toastForBookAction, toast, "Semua kolom harus diisi!")
        } else {
            // jika semua input sudah diisi, maka basic rules akan dieksekusi
            if (bookTitleVal.length < 3 || bookTitleVal.length > 32) {
                bookTitle.parentElement.children[0].style.color = "#f00";
            } else if (bookAuthorVal.length < 3 || bookAuthorVal.length > 32) {
                bookAuthor.parentElement.children[0].style.color = "#f00";
            } else if (bookYearVal.length !== 4) {
                bookYear.parentElement.children[0].style.color = "#f00";
            } else {
                // jika rules terpenuhi, ambil buku dari collections pada storage
                const booksInStorage = getBooks("collections");

                if (booksInStorage !== null) {
                    // mengambil random gradient color dari storage sebagai book cover yang akan permanen
                    const randomBookCover = bookCoversInStorage[Math.floor(Math.random() * 10)];
                    const id = +new Date(); // id buku yang akan dibuat

                    // membuat objek buku baru
                    const book = {
                        id: id,
                        title: bookTitleVal,
                        author: bookAuthorVal,
                        year: bookYearVal,
                        bookCover: randomBookCover,
                        isComplete: false
                    }

                    // menambahkan buku baru ke collections dan render ulang juga update jumlah buku
                    booksInStorage.push(book);
                    setBooks("collections", booksInStorage);
                    loadCollections();
                    updateCountBook();

                    // mengosongkan input
                    bookTitle.parentElement.children[0].style.color = "#000";
                    bookAuthor.parentElement.children[0].style.color = "#000";
                    bookYear.parentElement.children[0].style.color = "#000";

                    event.target.reset();
                }
            }
        }
    })

    // fitur filter pada buku-buku yang ada di Collection dan Read
    sorts.forEach(sort => {
        // ketika tombol filter di klik
        sort.children[0].addEventListener("click", event => {
            event.preventDefault();

             // mengambil elem sort itu sendiri
            const thisElem = selectSortBtn(event.target);
            // mengambil elem koleksi/read yang di handle orang elem sort
            const handleElem = document.getElementById(thisElem.getAttribute("data-handle"));
            // mengambil filter berdasarkan item
            let currentSortItem = handleElem.getAttribute("data-sort-item");
            // mengambil type sorting berdasarkan
            let currentSortType = handleElem.getAttribute("data-sort-type");

            // P1 = jika type sorting descending, maka diubah ke ascending
            if (currentSortType == "desc") {
                currentSortType = "asc";
                handleElem.setAttribute("data-sort-type", "asc");
                thisElem.children[0].setAttribute("src", "images/filter_asc.png");
            } else {
                // merubah filter berdasarkan item berikutnya
                currentSortItem = sortBy(currentSortItem);

                // sebaliknya dari P1
                currentSortType = "desc";
                handleElem.setAttribute("data-sort-type", "desc");
                thisElem.children[0].setAttribute("src", "images/filter_desc.png");
                // memasukkan nilai filter baru pada elem koleksi/read yang di handle
                handleElem.setAttribute("data-sort-item", currentSortItem);
                thisElem.setAttribute("data-sort-item", currentSortItem);
            }

            // proses render ulang berdasarkan type sorting dan filter item
            if (handleElem.classList.contains("book-at-collection")) {
                bookAtCollection.innerHTML = "";
                renderBooks(loadCollections(false), handleElem, currentSortItem, currentSortType);
            } else if (handleElem.classList.contains("book-at-read")) {
                bookAtRead.innerHTML = "";
                renderBooks(loadReads(false), handleElem, currentSortItem, currentSortType);
            }
        })
    });

    // semua elem (collection, read, table, box) sebagai penampung buku yang digeser
    allDropBook.forEach(dropBook => {
        // menampilkan fitur jumlah buku yang ada pada koleksi/read
        if (dropBook.classList.contains("book-at-collection") ||
            dropBook.classList.contains("book-at-read")) {
            dropBook.setAttribute("data-count-book", dropBook.children.length);
        }

        // elem sebagai penampung buku diberi dragstart sebagai bind ke buku yg dapat digeser
        dropBook.addEventListener("dragstart", (event) => {
            // inisialisasi buku yang dapat digeser
            const book = event.target;
            // mengambil id dari dropBook
            const idDropBook = book.parentElement.getAttribute("id");

            // P2: memberi class dragging yang hanya akan ada pada satu buku dari banyaknya buku
            book.classList.add("dragging");
            
            // P3: memberikan data pada buku memberitahukan darimana asal buku tersebut saat sedang digeser
            updateAttributeBook(book, idDropBook);
        })

        // elem sebagai penampung buku diberi dragsend sebagai bind ke buku yg selesai digeser
        dropBook.addEventListener("dragend", (event) => {
            // inisialisasi buku yang dapat digeser
            const book = event.target;
            // mengambil id dari dropBook
            const idDropBook = book.parentElement.getAttribute("id");

            // kebalikan dari P2
            book.classList.remove("dragging");
            // menghapus class active pada toast yang tampil
            toast.classList.remove("active");

            /*
                1. saat buku selesai digeser, apakah buku tersebut digeser dari table?
                2. atau table saat itu memang tidak terdapat buku?
                ----
                jika digeser dari table atau memang tidak terdapat buku (length == 0), maka tombol
                (Selesai Membaca/Baca Kembali), Kembalikan, dan Put in the Box akan mati/disable

                Tetapi jika buku digeser kedalam table (contains(book-at-table)), maka tombol
                (Selesai Membaca/Baca Kembali), Kembalikan, dan Put in the Box akan akan hidup kemblai/enable
            */
            if (bookAtTable.children.length == 0) {
                disableButton(recycleBtn, returnBtn, readAction, "disable");
            } else if(book.parentElement.classList.contains("book-at-table")) {
                disableButton(recycleBtn, returnBtn, readAction, "enable");
            }

            // mengubah teks pada tombol primary pada table sesuai dengan P3
            changeReadActionText(readAction);
                    
            // memberikan data baru pada buku memberitahukan buku tersebut sudah berada di koleksi/read
            updateAttributeBook(book, idDropBook);

            // proses pembaharuan buku-buku pada local storage
            // mengambil id buku lalu konversi ke integer
            const idBook = parseInt(book.getAttribute("data-id"));
            // inisialisasi untuk diisi ulang isinya
            // mengambil storageKey dari idDropBook yang mengandung teks storageKey itu sendiri
            let storageKey = idDropBook.substring(8);
            let dropToStorage = null;
            // disComplete berfungsi untuk merubah nilai isComplete di local storage pada masing-masing buku
            let disComplete = false;

            // jika buku yang digeser diletakkan di collection atau read
            if (dropBook.classList.contains("book-at-collection") ||
                dropBook.classList.contains("book-at-read")) {
                // maka storageKey diberi akhiran s untuk menyesuaikan pada local storage
                storageKey = storageKey+"s";
                // hanya collections dan reads yang berhak mengganti isi dari isComplete
                disComplete = true;
            }
            
            /* 
                mengambil data berbentuk array object dari storageKey
                berdasarkan buku yang digeser diletakkan dimana,
                apakah di collectoin, read, table, atau box?
            */
            dropToStorage = getBooks(storageKey);

            // eksekusi pemindahan buku dari storage semula ke storage pindah tempat
            if (moveBookToAnotherDragOver(dropToStorage, idBook, storageKey, disComplete) == false) {
                console.log("gagal memindahkan buku");
            }
        })

        // P5: elem yang mendandakan bahwasanya elem tersebut sebagai penampung
        dropBook.addEventListener("dragover", event => {
            event.preventDefault();

            // mengambil id dari dropBook
            const idDropBook = dropBook.getAttribute("id");
            // mengambil jumlah buku yang terdapat pada dropBook
            const length = document.querySelectorAll("."+idDropBook+" .book-cover:not(.dragging)").length;
    
            switch (true) {
                /*
                    pada setiap case, saat buku yang digeser akan diletakkan ke salah satu dari dropBook
                    table, collection, read ataupun box, maka di check apakah jumlah buku
                    dalam dropBook tersebut sudah mencapai maksimalnya, jika sudah maka toast akan aktif
                */
                case idDropBook == "book-at-table" && length >= 1:
                    toastActive("Meja buku hanya bisa menampung satu buku saja");
                    break;
                case (idDropBook == "book-at-collection" && length >= 10):
                    toastActive("Koleksi buku hanya bisa menampung 10 buku saja");
                    break;
                case (idDropBook == "book-at-read" && length >= 10):
                    toastActive("Buku yang sudah dibaca hanya bisa menampung 10 buku saja");
                    break;
                case (idDropBook == "book-at-box" && length >= 10):
                    toastActive("Buku dalam kotak hanya bisa menampung 10 buku saja");
                    break;
                default:
                    // dieksekusi ketika tempat buku masih muat untuk diletakkan buku
                    // mengambil elem yang memiliki class dragging
                    const dragging = document.querySelector(".dragging");
                    
                    // elem tersebut dimasukkan ke dalam dropBook
                    dropBook.appendChild(dragging);
                    // lalu jumlahnya diupdate
                    updateCountBook();
            }
        });

        // berdasarkan P5, saat tidak diarahkan lagi ke tempat tersebut
        dropBook.addEventListener("dragleave", () => {
            // maka toast dinonaktifkan
            toast.classList.remove("active");
        });
    })

    // elem box di click sebagai bind pada setiap buku didalamnya
    bookAtBox.addEventListener("click", event => {
        // mengambil elemen utama book
        const book = selectBookCover(event.target.parentElement);

        // check apakan elemen tersebut merupakan benar-benar elemen tuama book
        if (book.classList.contains("book-cover")) {
            // menghapus attribut pada deleteBookBtn yang diisi saat buku pada box di klik kanan
            deleteBookBtn.removeAttribute("style");
            deleteBookBtn.removeAttribute("data-delete-book-id");
            
            // jika buku mendapat class always-active, maka classnya dihapus
            if (book.classList.contains("always-active")) {
                book.classList.remove("always-active");
            } else {
                // jika tidak, tambahkan atau hapus class active
                book.classList.toggle("active");
            }

            // saat cursor tidak berada lagi di wilayah book, maka class active dihapus
            book.addEventListener("mouseleave", () => {
                book.classList.remove("active");
            })
        }
    })

    // elem box di klik kanan sebagai bind pada setiap book didalamnya
    bookAtBox.addEventListener("contextmenu", event => {
        event.preventDefault();

        // mengambil elemen utama book
        const book = selectBookCover(event.target.parentElement);

        // check apakan elemen tersebut merupakan benar-benar elemen tuama book
        if (book.classList.contains("book-cover")) {
            // mengambil id book
            const idBook = book.getAttribute("data-id");
            // mengambil jarak cursor dari batas atas browser dan dari batas kiri
            const top = event.clientY - (deleteBookBtn.offsetHeight / 2) - 2;
            const left = event.clientX - (deleteBookBtn.offsetWidth / 2);

            // P6: memasukkan nilai style pada tombol delete book
            deleteBookBtn.style.top = top+"px";
            deleteBookBtn.style.left = left+"px";

            // menambahkan class always-active saat book di klik kanan
            document.querySelector(`.book-at-box .book-cover[data-id="${idBook}"]`).classList.add("always-active");
            // P7: juga menambahkan data id book ke dalam tombol delete book
            deleteBookBtn.setAttribute("data-delete-book-id", idBook);
        }
    })

    // saat cursor tidak berada diwilayah deleteBookBtn
    deleteBookBtn.addEventListener("mouseleave", event => {
        // hapus attribut yang dibuat dari P6 dan P7
        deleteBookBtn.removeAttribute("style");
        deleteBookBtn.removeAttribute("data-delete-book-id");
    })

    // proses menghapus satu book pada box ketika klik deleteBookBtn 
    deleteBookBtn.addEventListener("click", event => {
        // mengambil id book
        const idBook = deleteBookBtn.getAttribute("data-delete-book-id");
        // mengambil elem book
        const book = document.querySelector(`.book-at-box .book-cover[data-id="${idBook}"]`);

        // animasi menghilangkan book
        book.style.transform = "scale(0)";

        deleteBookBtn.removeAttribute("style");
        deleteBookBtn.removeAttribute("data-delete-book-id");
        btnDeleteBooksAtBox.children[0].classList.toggle("active");

        setTimeout(() => {
            // book sudah dihapus sepenuhnya dari document
            btnDeleteBooksAtBox.children[0].classList.toggle("active");
            book.remove();
        }, 1000);

        // proses menghapus book dari storage
        // mengambil data box pada local storage dan mencari indexKey dari book tersebut
        const bookDataToDelete = findIndexBookIdFromAllStorage('box', parseInt(idBook), true);
        const storage = bookDataToDelete[0];
        const storageKey = bookDataToDelete[1];
        const indexKey = bookDataToDelete[2];

        // menghapus book dari array storage (box storage)
        storage.splice(indexKey, 1);
        // memperbaharui isi dari box storage
        setBooks(storageKey, storage);
    })

    // proses menghapus semua book pada box
    btnDeleteBooksAtBox.addEventListener('click', event => {
        event.preventDefault();

        // mengambil elem anchor (<a>)
        const img = event.target;

        // memberi animasi proses penghapusan books pada box
        img.classList.toggle("active");
        document.querySelectorAll(".book-at-box .book-cover").forEach(book => {
            book.style.transform = "scale(0)";
        })

        setTimeout(() => {
            // books sudah dihapus sepenuhnya dari document
            bookAtBox.innerHTML = "";
            img.classList.toggle("active");
        }, 1000);

        // mengosongkan isi dari box storage
        setBooks('box', []);
    }, false)

    // proses menampilkan form menambah book baru
    cancelOrAdd.addEventListener("click", event => {
        event.preventDefault();

        // P8: tidak akan klik saat proses animasi toast sedang berjalan
        if (clickedCancelOrAdd) {
            return false;
        }

        /*
            setiap book yang ditambah akan diletakkan di collection,
            maka dicek dahulu apakah collection masih bisa menampung book?
            dan juga apakah saat tombol tersebut ditekan form benar-benar belum tampil?
            jika ya, maka P8 berlaku dan memberikan 
        */
        if (bookAtCollection.children.length >= 10 && !cancelOrAdd.classList.contains("open-big")) {
            toastActive("Tidak dapat menambahkan buku karena \n koleksi sudah mencapai maksimal");
            clickedCancelOrAdd = true;

            // animasi toast sedang berjalan

            setTimeout(() => {
                // animasi toast selesai, dan tombol sudah bisa di klik kembali
                clickedCancelOrAdd = false;
                toast.classList.remove("active");
            }, 3000);

            return false;
        }

        cancelOrAdd.classList.toggle("open-big");

        document.querySelector(".big-btn-container").classList.toggle("to-big")
        document.querySelector(".big-btn-container").classList.toggle("to-small");
        document.querySelector(".overlay").classList.toggle("hide");

        // cek apakah tombol cancelOrAdd terdapat class open-big
        if(cancelOrAdd.classList.contains("open-big")) {
            // jika ya, maka teks "New Collection" akan diganti
            document.getElementById("title-new-collection").innerText = "Tambah Koleksi Buku";

            setTimeout(() => {
                // memberikan animasi menampilkan form input
                document.querySelector(".big-btn-container form").classList.toggle("active");
            }, 1000);
        } else {
            // P9: jika tidak, maka label yang mendapat attribut style saat proses pengetikan akan dihapus
            document.querySelectorAll(".big-btn-container form label").forEach(input => {
                input.removeAttribute("style");
            });

            // juga isi dari input yang sudah diisi akan direset dan merubahnya seperti awal
            document.querySelector(".big-btn-container form").reset();
            document.getElementById("title-new-collection").innerText = "New Collection"
            document.querySelector(".big-btn-container form").classList.toggle("active");
        }
    });

    // menekan tombol tutup dan icon X (close) saat form sedang tampil
    cancel.addEventListener("click", event => {
        // eksekusi P9
        cancelOrAdd.click();
    });

    // tampilan fokus pada form, saat area kehitaman diluar form diklik, maka
    overlay.addEventListener("click", event => {
        // eksekusi P9
        cancelOrAdd.click();
    });

    // proses mengolah book pada table
    readAction.addEventListener("click", event => {
        event.preventDefault();

        // jika tombol readAction terdapat class disabled, maka tombol tidak mengeksekusi apapun
        if (readAction.classList.contains("disabled")) {
            return false;
        }

        // table harus memiliki book untuk mengeksekusi tombol readAction sepenuhnya
        if (bookAtTable.hasChildNodes()) {
            // mengambil book melalui seleksi anak pertama dari table elem
            const book = bookAtTable.children[0];
            // mengambil asal book tersebut hanya dari collection atau read
            const bookFrom = book.getAttribute("data-book-from");
            // mengambil id book dan konversi ke integer
            const idBook = parseInt(book.getAttribute("data-id"));

            let bookTo = null;
            let idTextBookTo = "";
            let toastText = "";

            /*
                jika book berasal dari read, berarti tombol readAction menganduk teks "Baca Kembali"
                yang bermakna book yang berasal dari read akan dipindahkan ke collection
                dan itu vice versa (berlaku sebaliknya ketika book berasal dari collection)
            */
            if (bookFrom == "book-at-read") {
                idTextBookTo = "book-at-collection";
                // P11: karena book berasal dari read, maka ambil elem collection
                bookTo = document.querySelector(`#${idTextBookTo}`);
                toastText = "Tidak dapat menambahkan buku karena \n koleksi sudah mencapai maksimal";
            } else if (bookFrom == "book-at-collection") {
                idTextBookTo = "book-at-read";
                // vice versa P11
                bookTo = document.querySelector(`#${idTextBookTo}`);
                toastText = "Buku yang sudah dibaca hanya bisa menampung 10 buku saja";
            }

            // check apakah dropTo sudah melebihi kapasitas?
            if (bookTo.children.length >= 10) {
                // jika ya tampilkan toast
                return hideToast(toastForBookAction, toast, toastText)
            } else {
                // jika tidak, maka proses pemindahan book
                /*
                    attr book diperbaharui sesusai tempat book itu diletakkan
                    P12: e.g. jika berasal dari read, maka attr berisi collection
                */ 
                book.setAttribute("data-book-from", idTextBookTo);
                // book resmi pindah tempat dari table ke collection atau read
                bookTo.appendChild(book);
                
                /* 
                    mengambil storageKey dari idTextBookTo yang mengandung teks 
                    storageKey itu sendiri dan memberi akhiran s menyesuaikan local storage
                */
                const storageKey = idTextBookTo.substring(8)+"s";
                /* 
                    mengambil data berbentuk array object dari storageKey
                    berdasarkan eksekusi tombol readAction,
                    apakah di collectoin atau read?
                    P13: jika berdasarkan P12, maka storageKey adalah collections
                */
                const dropToStorage = getBooks(storageKey);
                
                if (moveBookToAnotherDragOver(dropToStorage, idBook, storageKey, true) == false) {
                    console.log("gagal memindahkan buku");
                }

                updateCountBook();
                // nonaktifkan tombol pada table
                disableButton(recycleBtn, returnBtn, readAction);
            }
        }
    })

    recycleBtn.addEventListener("click", event => {
        event.preventDefault();

        // tombol Put in the Box tidak dieksekusi apabila memiliki class disabled
        if (recycleBtn.classList.contains("disabled")) {
            return false;
        }

        if (bookAtTable.hasChildNodes()) {
            // apakah book dalam box sudah melebihi kapasitas?
            if (bookAtBox.children.length >= 10) {
                return hideToast(toastForBox, toast, "Buku dalam kotak hanya bisa menampung 10 buku saja")
            }

            // jika tidak, jalankan proses pemindahan book
            const book = bookAtTable.children[0];
            const idBook = parseInt(book.getAttribute("data-id"));
            const storageKey = "box";
            const dropToStorage = getBooks(storageKey);

            // book resmi pindah tempat dari table ke box
            bookAtBox.appendChild(book);
                
            if (moveBookToAnotherDragOver(dropToStorage, idBook, storageKey, false) == false) {
                console.log("gagal memindahkan buku");
            }

            updateCountBook();
            disableButton(recycleBtn, returnBtn, readAction);
        }
    })

    returnBtn.addEventListener("click", event => {
        event.preventDefault();

        // tombol Kembalikan tidak dieksekusi apabila memiliki class disabled
        if (returnBtn.classList.contains("disabled")) {
            return false;
        }

        if (bookAtTable.hasChildNodes()) {
            const book = bookAtTable.children[0];
            // P14: mengambil data book berasal dari collection atau read
            const bookFrom = book.getAttribute("data-book-from");
            const idBook = parseInt(book.getAttribute("data-id"));
            // mengambil elem berdasarkan P14
            const dropBook = document.querySelector(`#${bookFrom}`);

            let toastText = "";

            // memberi teks untuk toast
            if (bookFrom == "book-at-collection") {
                toastText = "Tidak dapat menambahkan buku karena \n koleksi sudah mencapai maksimal";
            } else if (bookFrom == "book-at-read") {
                toastText = "Buku yang sudah dibaca hanya bisa menampung 10 buku saja";
            }

            // berdasarkan P14, apakah asal tempat book sudah memenuhi kapasitas?
            if (dropBook.children.length >= 10) {
                return hideToast(toastForBookAction, toast, toastText)
            } else {
                // jika tidak, book resmi kembali pindah ke tempat semula
                dropBook.appendChild(book);
                
                const storageKey = bookFrom.substring(8)+"s";
                const dropToStorage = getBooks(storageKey);
                    
                if (moveBookToAnotherDragOver(dropToStorage, idBook, storageKey, true) == false) {
                    console.log("gagal memindahkan buku");
                }

                updateCountBook();
                disableButton(recycleBtn, returnBtn, readAction);
            }
        }
    })
});