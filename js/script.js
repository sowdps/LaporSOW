/**
 * ============================================================
 * MY SOW BALI
 * LAPOR SOW
 * ============================================================
 *
 * FILE:
 * js/script.js
 *
 * VERSI:
 * FINAL
 *
 * FUNGSI:
 * 1. Menghubungkan Form User dengan Apps Script
 * 2. Memuat Master Data Cabang
 * 3. Memuat Master Data Jenis Kendala
 * 4. Menampilkan kode SOW sementara
 * 5. Mengirim Order
 * 6. Menampilkan kode order resmi dari Backend
 * 7. Menampilkan hasil pengiriman
 *
 * PENTING:
 * ------------------------------------------------------------
 * File ini TIDAK mengirim WhatsApp secara langsung.
 *
 * Alur:
 *
 * USER FORM
 *     ↓
 * script.js
 *     ↓
 * Google Apps Script
 *     ↓
 * Database / Google Sheet
 *     ↓
 * Backend
 *     ├── WhatsApp Admin
 *     ├── WhatsApp Group
 *     ├── WhatsApp Pelapor
 *     └── Email
 *
 * JANGAN menambahkan:
 * - NOMOR_ADMIN
 * - nomor WhatsApp Admin
 * - wa.me
 * - window.open WhatsApp
 * - token Fonnte
 *
 * KODE ORDER RESMI:
 * ------------------------------------------------------------
 * Kode order resmi dibuat oleh BACKEND.
 *
 * Contoh:
 * SOW-130759
 *
 * Kode yang ditampilkan sebelum submit hanya kode sementara.
 * Setelah order berhasil, kode dari backend menjadi kode resmi.
 *
 * ============================================================
 */


/* ============================================================
   1. KONFIGURASI
   ============================================================ */

/**
 * URL Web App Google Apps Script.
 *
 * Semua komunikasi Form User menuju Backend
 * menggunakan URL ini.
 */
const WEB_APP_URL =
    "https://script.google.com/macros/s/AKfycbwMyIJyYAX2Ioik1Bv_TM5lx-XgLdmhay0vwbl3jNc_rQ7fN_ShL3rPbEAefk381_o/exec";


/* ============================================================
   2. HELPER ELEMENT HTML
   ============================================================ */

/**
 * Mengambil seluruh element yang digunakan Form.
 *
 * ID harus sesuai dengan index.html.
 */
function getElements() {

    return {

        form:
            document.getElementById("orderForm"),

        nama:
            document.getElementById("nama"),

        unitKerja:
            document.getElementById("unit_kerja"),

        kodeCabang:
            document.getElementById("kode_cabang"),

        jenisKendala:
            document.getElementById("jenis_kendala"),

        deskripsi:
            document.getElementById("deskripsi"),

        whatsapp:
            document.getElementById("whatsapp"),

        tanggal:
            document.getElementById("tanggal"),

        jam:
            document.getElementById("jam"),

        kode:
            document.getElementById("kode"),

        submitBtn:
            document.getElementById("submitBtn"),

        message:
            document.getElementById("success")

    };

}


/* ============================================================
   3. TAMPILKAN PESAN
   ============================================================ */

/**
 * Menampilkan pesan kepada pengguna.
 *
 * @param {string} message
 * @param {"success"|"error"} type
 */
function showMessage(
    message,
    type = "success"
) {

    const elements =
        getElements();


    if (
        !elements.message
    ) {

        return;

    }


    elements.message.style.display =
        "block";


    if (
        type === "success"
    ) {

        elements.message.className =
            "success-message";

    } else {

        elements.message.className =
            "error-message";

    }


    elements.message.innerHTML =
        message;

}


/* ============================================================
   4. SEMBUNYIKAN PESAN
   ============================================================ */

/**
 * Menghapus pesan yang sedang tampil.
 */
function hideMessage() {

    const elements =
        getElements();


    if (
        !elements.message
    ) {

        return;

    }


    elements.message.innerHTML =
        "";

    elements.message.style.display =
        "none";

    elements.message.className =
        "";

}


/* ============================================================
   5. ESCAPE HTML
   ============================================================ */

/**
 * Mengamankan data sebelum ditampilkan
 * sebagai HTML.
 */
function escapeHtml(
    value
) {

    return String(
        value ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


/* ============================================================
   6. GENERATE KODE SOW SEMENTARA
   ============================================================ */

/**
 * Membuat kode sementara untuk tampilan form.
 *
 * PENTING:
 * ------------------------------------------------------------
 * Kode ini BUKAN kode resmi database.
 *
 * Kode resmi dibuat Backend ketika order disimpan.
 *
 * Format:
 *
 * SOW-XXXXXX
 *
 * Contoh:
 *
 * SOW-A7K92P
 */
function generateTemporarySowCode() {

    const elements =
        getElements();


    if (
        !elements.kode
    ) {

        return "";

    }


    const characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";


    let randomCode =
        "";


    for (
        let i = 0;
        i < 6;
        i++
    ) {

        const index =
            Math.floor(
                Math.random() *
                characters.length
            );


        randomCode +=
            characters.charAt(
                index
            );

    }


    const code =
        `SOW-${randomCode}`;


    elements.kode.value =
        code;


    return code;

}


/* ============================================================
   7. TANGGAL HARI INI
   ============================================================ */

/**
 * Menghasilkan tanggal hari ini.
 *
 * Format:
 * YYYY-MM-DD
 */
function getToday() {

    const now =
        new Date();


    const year =
        now.getFullYear();


    const month =
        String(
            now.getMonth() + 1
        )
            .padStart(
                2,
                "0"
            );


    const day =
        String(
            now.getDate()
        )
            .padStart(
                2,
                "0"
            );


    return `${year}-${month}-${day}`;

}


/* ============================================================
   8. JAM SAAT INI
   ============================================================ */

/**
 * Menghasilkan jam sekarang.
 *
 * Format:
 * HH:MM
 */
function getCurrentTime() {

    const now =
        new Date();


    const hour =
        String(
            now.getHours()
        )
            .padStart(
                2,
                "0"
            );


    const minute =
        String(
            now.getMinutes()
        )
            .padStart(
                2,
                "0"
            );


    return `${hour}:${minute}`;

}


/* ============================================================
   9. SET TANGGAL DAN JAM DEFAULT
   ============================================================ */

/**
 * Mengisi tanggal dan jam otomatis
 * jika masih kosong.
 */
function setDefaultDateTime() {

    const elements =
        getElements();


    if (
        elements.tanggal &&
        !elements.tanggal.value
    ) {

        elements.tanggal.value =
            getToday();

    }


    if (
        elements.jam &&
        !elements.jam.value
    ) {

        elements.jam.value =
            getCurrentTime();

    }

}


/* ============================================================
   10. LOAD MASTER DATA
   ============================================================ */

/**
 * Mengambil Master Data dari Apps Script.
 *
 * Data:
 * - CABANG
 * - JENIS KENDALA
 */
async function loadMasterData() {

    const elements =
        getElements();


    if (
        !elements.kodeCabang ||
        !elements.jenisKendala
    ) {

        console.error(
            "Element Master Data tidak ditemukan."
        );

        return;

    }


    try {

        /* ----------------------------------------------------
           STATUS LOADING
           ---------------------------------------------------- */

        elements.kodeCabang.innerHTML =
            '<option value="">Memuat cabang...</option>';


        elements.jenisKendala.innerHTML =
            '<option value="">Memuat jenis kendala...</option>';


        /* ----------------------------------------------------
           REQUEST KE BACKEND
           ---------------------------------------------------- */

        const response =
            await fetch(
                `${WEB_APP_URL}?master=true`,
                {

                    method:
                        "GET",

                    cache:
                        "no-store"

                }
            );


        /* ----------------------------------------------------
           CEK HTTP
           ---------------------------------------------------- */

        if (
            !response.ok
        ) {

            throw new Error(
                `Server mengembalikan HTTP ${response.status}.`
            );

        }


        /* ----------------------------------------------------
           BACA RESPONSE
           ---------------------------------------------------- */

        const text =
            await response.text();


        if (
            !text
        ) {

            throw new Error(
                "Server tidak memberikan response Master Data."
            );

        }


        let data;


        try {

            data =
                JSON.parse(
                    text
                );

        }

        catch (
        error
        ) {

            console.error(
                "Response Master Data:",
                text
            );


            throw new Error(
                "Response Master Data bukan JSON yang valid."
            );

        }


        if (
            !data
        ) {

            throw new Error(
                "Server tidak mengembalikan Master Data."
            );

        }


        if (
            data.success === false
        ) {

            throw new Error(
                data.message ||
                "Master Data gagal dimuat."
            );

        }


        /* ====================================================
           MASTER CABANG
           ==================================================== */

        elements.kodeCabang.innerHTML =
            '<option value="">-- Pilih Kode Cabang --</option>';


        if (
            Array.isArray(
                data.cabang
            )
        ) {

            data.cabang.forEach(
                function (item) {

                    const option =
                        document.createElement(
                            "option"
                        );


                    let value =
                        "";

                    let label =
                        "";


                    /* ----------------------------------------
                       BACKEND MENGIRIM STRING
                       ---------------------------------------- */

                    if (
                        typeof item ===
                        "string"
                    ) {

                        value =
                            item.trim();

                        label =
                            item.trim();

                    }


                    /* ----------------------------------------
                       BACKEND MENGIRIM OBJECT
                       ---------------------------------------- */

                    else if (
                        item &&
                        typeof item ===
                        "object"
                    ) {

                        value =
                            item.kode ||
                            item.kode_cabang ||
                            item.kodeCabang ||
                            item.value ||
                            "";


                        label =
                            item.nama ||
                            item.nama_cabang ||
                            item.namaCabang ||
                            item.label ||
                            value;

                    }


                    value =
                        String(
                            value
                        ).trim();


                    label =
                        String(
                            label
                        ).trim();


                    if (
                        !value
                    ) {

                        return;

                    }


                    option.value =
                        value;


                    /*
                     * Tampilkan:
                     *
                     * 7730 - KCP GATOT SUBROTO TIMUR
                     *
                     */

                    option.textContent =
                        label &&
                            label !== value
                            ? `${value} - ${label}`
                            : value;


                    elements.kodeCabang
                        .appendChild(
                            option
                        );

                }
            );

        }


        /* ====================================================
           MASTER JENIS KENDALA
           ==================================================== */

        elements.jenisKendala.innerHTML =
            '<option value="">-- Pilih Jenis Kendala --</option>';


        if (
            Array.isArray(
                data.kendala
            )
        ) {

            data.kendala.forEach(
                function (item) {

                    const option =
                        document.createElement(
                            "option"
                        );


                    let value =
                        "";

                    let label =
                        "";


                    /* ----------------------------------------
                       STRING
                       ---------------------------------------- */

                    if (
                        typeof item ===
                        "string"
                    ) {

                        value =
                            item.trim();

                        label =
                            item.trim();

                    }


                    /* ----------------------------------------
                       OBJECT
                       ---------------------------------------- */

                    else if (
                        item &&
                        typeof item ===
                        "object"
                    ) {

                        value =
                            item.kode ||
                            item.jenis ||
                            item.jenis_kendala ||
                            item.nama ||
                            item.value ||
                            "";


                        label =
                            item.nama ||
                            item.jenis ||
                            item.jenis_kendala ||
                            item.label ||
                            value;

                    }


                    value =
                        String(
                            value
                        ).trim();


                    label =
                        String(
                            label
                        ).trim();


                    if (
                        !value
                    ) {

                        return;

                    }


                    option.value =
                        value;


                    option.textContent =
                        label;


                    elements.jenisKendala
                        .appendChild(
                            option
                        );

                }
            );

        }


        /* ----------------------------------------------------
           HASIL
           ---------------------------------------------------- */

        const jumlahCabang =
            elements.kodeCabang
                .options.length -
            1;


        const jumlahKendala =
            elements.jenisKendala
                .options.length -
            1;


        console.log(
            `Master Data berhasil dimuat. Cabang: ${jumlahCabang}, Kendala: ${jumlahKendala}`
        );

    }

    catch (
    error
    ) {

        console.error(
            "Gagal memuat Master Data:",
            error
        );


        elements.kodeCabang.innerHTML =
            '<option value="">Gagal memuat cabang</option>';


        elements.jenisKendala.innerHTML =
            '<option value="">Gagal memuat jenis kendala</option>';


        showMessage(
            "⚠️ Master Data belum dapat dimuat. Silakan periksa koneksi dan coba lagi.",
            "error"
        );

    }

}


/* ============================================================
   11. NORMALISASI NOMOR WHATSAPP PELAPOR
   ============================================================ */

/**
 * Membersihkan nomor WhatsApp PELAPOR.
 *
 * Contoh:
 *
 * 081234567890
 *
 * menjadi:
 *
 * 6281234567890
 */
function normalizeWhatsApp(
    number
) {

    let value =
        String(
            number || ""
        ).trim();


    value =
        value.replace(
            /[^0-9+]/g,
            ""
        );


    if (
        value.startsWith("+")
    ) {

        value =
            value.substring(
                1
            );

    }


    if (
        value.startsWith("0")
    ) {

        value =
            "62" +
            value.substring(
                1
            );

    }


    return value;

}


/* ============================================================
   12. AMBIL DATA FORM
   ============================================================ */

/**
 * Mengambil seluruh data Form.
 *
 * CATATAN:
 * ------------------------------------------------------------
 * Kode yang dikirim ke Backend hanya sebagai referensi.
 *
 * Backend tetap membuat kode order resmi.
 */
function getOrderData() {

    const elements =
        getElements();


    return {

        /*
         * WAJIB
         * Backend menggunakan action ini.
         */
        action:
            "createOrder",


        /*
         * Kode tampilan sementara.
         *
         * Backend tidak menganggap ini sebagai
         * kode final apabila ingin membuat kode unik.
         */
        kode:
            elements.kode
                ? elements.kode.value.trim()
                : "",


        nama:
            elements.nama
                ? elements.nama.value.trim()
                : "",


        unit_kerja:
            elements.unitKerja
                ? elements.unitKerja.value.trim()
                : "",


        kode_cabang:
            elements.kodeCabang
                ? elements.kodeCabang.value.trim()
                : "",


        jenis_kendala:
            elements.jenisKendala
                ? elements.jenisKendala.value.trim()
                : "",


        deskripsi:
            elements.deskripsi
                ? elements.deskripsi.value.trim()
                : "",


        whatsapp:
            elements.whatsapp
                ? elements.whatsapp.value.trim()
                : "",


        tanggal:
            elements.tanggal
                ? elements.tanggal.value
                : "",


        jam:
            elements.jam
                ? elements.jam.value
                : ""

    };

}


/* ============================================================
   13. VALIDASI FORM
   ============================================================ */

/**
 * Memastikan semua data wajib telah diisi.
 */
function validateOrderData(
    data
) {

    if (
        !data.nama
    ) {

        return "Nama pelapor wajib diisi.";

    }


    if (
        !data.unit_kerja
    ) {

        return "Unit kerja wajib diisi.";

    }


    if (
        !data.kode_cabang
    ) {

        return "Kode cabang wajib dipilih.";

    }


    if (
        !data.jenis_kendala
    ) {

        return "Jenis kendala wajib dipilih.";

    }


    if (
        !data.deskripsi
    ) {

        return "Deskripsi kendala wajib diisi.";

    }


    if (
        !data.whatsapp
    ) {

        return "Nomor WhatsApp pelapor wajib diisi.";

    }


    if (
        !data.tanggal
    ) {

        return "Tanggal order wajib diisi.";

    }


    if (
        !data.jam
    ) {

        return "Jam order wajib diisi.";

    }


    return null;

}


/* ============================================================
   14. KIRIM ORDER KE APPS SCRIPT
   ============================================================ */

/**
 * Mengirim data order ke Google Apps Script.
 *
 * TIDAK mengirim WhatsApp.
 *
 * Backend menangani:
 * - Penyimpanan
 * - WhatsApp Admin
 * - WhatsApp Group
 * - WhatsApp Pelapor
 * - Email
 */
async function sendOrderToBackend(
    data
) {

    const response =
        await fetch(
            WEB_APP_URL,
            {

                method:
                    "POST",

                headers: {

                    "Content-Type":
                        "text/plain;charset=utf-8"

                },

                body:
                    JSON.stringify(
                        data
                    )

            }
        );


    if (
        !response.ok
    ) {

        throw new Error(
            `Server mengembalikan HTTP ${response.status}.`
        );

    }


    const text =
        await response.text();


    if (
        !text
    ) {

        throw new Error(
            "Server tidak memberikan response."
        );

    }


    try {

        return JSON.parse(
            text
        );

    }

    catch (
    error
    ) {

        console.error(
            "Response backend:",
            text
        );


        throw new Error(
            "Response dari server tidak valid."
        );

    }

}


/* ============================================================
   15. SET STATUS TOMBOL
   ============================================================ */

/**
 * Mengubah tombol menjadi status proses.
 */
function setSubmitLoading(
    loading
) {

    const elements =
        getElements();


    if (
        !elements.submitBtn
    ) {

        return;

    }


    if (
        loading
    ) {

        if (
            !elements.submitBtn.dataset
                .originalText
        ) {

            elements.submitBtn.dataset
                .originalText =
                elements.submitBtn
                    .textContent;

        }


        elements.submitBtn.disabled =
            true;


        elements.submitBtn.textContent =
            "MENGIRIM ORDER...";

    }

    else {

        elements.submitBtn.disabled =
            false;


        elements.submitBtn.textContent =
            elements.submitBtn.dataset
                .originalText ||
            "KIRIM ORDER";

    }

}


/* ============================================================
   16. TAMPILKAN KODE RESMI BACKEND
   ============================================================ */

/**
 * Mengambil kode order resmi dari response Backend.
 *
 * Backend final mengirim:
 *
 * result.kode_order
 *
 * atau:
 *
 * result.kode
 */
function getOfficialOrderCode(
    result
) {

    if (
        !result
    ) {

        return "";

    }


    return (

        result.kode_order ||

        result.kode ||

        result.kodeOrder ||

        result.order?.kode_order ||

        result.order?.kode ||

        result.order?.kodeOrder ||

        result.data?.kode_order ||

        result.data?.kode ||

        result.data?.kodeOrder ||

        ""

    );

}


/* ============================================================
   17. HANDLE SUBMIT
   ============================================================ */

/**
 * Proses utama ketika tombol
 * KIRIM ORDER ditekan.
 */
async function handleSubmit(
    event
) {

    event.preventDefault();


    hideMessage();


    const data =
        getOrderData();


    /*
     * Normalisasi WhatsApp pelapor.
     */
    data.whatsapp =
        normalizeWhatsApp(
            data.whatsapp
        );


    /*
     * Validasi.
     */
    const validationError =
        validateOrderData(
            data
        );


    if (
        validationError
    ) {

        showMessage(
            `⚠️ ${escapeHtml(validationError)}`,
            "error"
        );


        return;

    }


    /*
     * Loading.
     */
    setSubmitLoading(
        true
    );


    try {

        console.log(
            "Mengirim order:",
            data
        );


        /*
         * Kirim ke Backend.
         */
        const result =
            await sendOrderToBackend(
                data
            );


        console.log(
            "Response createOrder:",
            result
        );


        /*
         * Cek response.
         */
        const success =
            result &&
            (
                result.success === true ||
                result.status === true
            );


        if (
            !success
        ) {

            throw new Error(
                result?.message ||
                result?.error ||
                "Order gagal disimpan."
            );

        }


        /*
         * Ambil KODE ORDER RESMI
         * dari Backend.
         */
        const kodeOrder =
            getOfficialOrderCode(
                result
            );


        if (
            !kodeOrder
        ) {

            throw new Error(
                "Order tersimpan tetapi kode order resmi tidak diterima dari server."
            );

        }


        /*
         * Tampilkan kode resmi.
         */
        showMessage(
            `
                <strong>✅ ORDER BERHASIL DIKIRIM</strong>
                <br><br>

                <strong>Kode SOW:</strong>
                ${escapeHtml(kodeOrder)}

                <br>

                <strong>Nama:</strong>
                ${escapeHtml(data.nama)}

                <br>

                <strong>Cabang:</strong>
                ${escapeHtml(
                result.cabang ||
                result.nama_cabang ||
                data.kode_cabang
            )}

                <br>

                <strong>Status:</strong>
                MENUNGGU

                <br><br>

                Order sudah masuk ke sistem MY SOW BALI.
            `,
            "success"
        );


        /*
         * Tampilkan kode resmi pada field.
         *
         * Jangan langsung reset field kode
         * sebelum pengguna melihat hasil.
         */
        const elements =
            getElements();


        if (
            elements.kode
        ) {

            elements.kode.value =
                kodeOrder;

        }


        /*
         * Reset field lainnya.
         *
         * Kode resmi tetap ditampilkan.
         */
        if (
            elements.form
        ) {

            const kodeResmi =
                kodeOrder;


            elements.form.reset();


            if (
                elements.kode
            ) {

                elements.kode.value =
                    kodeResmi;

            }

        }


        /*
         * Tanggal dan jam baru.
         */
        setDefaultDateTime();


        /*
         * Setelah beberapa detik,
         * tampilkan kode SOW baru untuk
         * order berikutnya.
         *
         * Tidak langsung dilakukan supaya
         * kode hasil order tetap terlihat.
         */
        window.setTimeout(
            function () {

                const currentElements =
                    getElements();


                if (
                    currentElements.kode
                ) {

                    generateTemporarySowCode();

                }

            },
            5000
        );

    }

    catch (
    error
    ) {

        console.error(
            "Gagal mengirim order:",
            error
        );


        showMessage(
            `
                <strong>❌ ORDER GAGAL DIKIRIM</strong>

                <br><br>

                ${escapeHtml(
                error.message ||
                "Terjadi kesalahan pada sistem."
            )}

                <br><br>

                Silakan coba lagi.
            `,
            "error"
        );

    }

    finally {

        setSubmitLoading(
            false
        );

    }

}


/* ============================================================
   18. INISIALISASI FORM
   ============================================================ */

/**
 * Menjalankan konfigurasi awal User Form.
 */
async function initializeApp() {

    console.log(
        "===================================="
    );

    console.log(
        "MY SOW BALI - User Form"
    );

    console.log(
        "Initializing..."
    );

    console.log(
        "===================================="
    );


    const elements =
        getElements();


    /*
     * Pastikan Form ada.
     */
    if (
        !elements.form
    ) {

        console.error(
            "Form dengan ID 'orderForm' tidak ditemukan."
        );


        return;

    }


    /*
     * --------------------------------------------------------
     * KODE ORDER SEMENTARA
     * --------------------------------------------------------
     *
     * Ini yang seharusnya membuat field
     * KODE ORDER tidak lagi bertuliskan:
     *
     * Memuat...
     *
     * tetapi:
     *
     * SOW-XXXXXX
     */
    generateTemporarySowCode();


    /*
     * Tanggal dan jam.
     */
    setDefaultDateTime();


    /*
     * Master Data.
     */
    await loadMasterData();


    /*
     * Event Submit.
     */
    elements.form.addEventListener(
        "submit",
        handleSubmit
    );


    console.log(
        "MY SOW BALI - User Form siap."
    );

}


/* ============================================================
   19. JALANKAN APLIKASI
   ============================================================ */

document.addEventListener(
    "DOMContentLoaded",
    initializeApp
);
