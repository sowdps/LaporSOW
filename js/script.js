/* =========================================
   KONFIGURASI
========================================= */

const WEB_APP_URL =
    "https://script.google.com/macros/s/AKfycbyOcM6jK4OHqHwd7203Do9Za0W23ZpA4wfmvBd2UsqQT_7v359DkjKTxdeaEqjQlqhV/exec";

const NOMOR_ADMIN = "6281999486279";


/* =========================================
   MASTER DATA DARI GOOGLE SPREADSHEET
========================================= */

async function loadMasterData() {

    try {

        const response =
            await fetch(
                WEB_APP_URL + "?master=true"
            );

        const data =
            await response.json();


        if (!data.success) {

            console.error(
                "MASTER_DATA gagal dimuat:",
                data.message
            );

            return;
        }


        /* =====================================
           KODE CABANG
        ===================================== */

        const cabangSelect =
            document.getElementById(
                "kode_cabang"
            );


        if (cabangSelect) {

            cabangSelect.innerHTML =
                '<option value="">Pilih Cabang</option>';


            data.cabang.forEach(
                function (item) {

                    let kode =
                        String(
                            item.kode || ""
                        ).trim();


                    /*
                       Format kode menjadi 4 digit.

                       40   → 0040
                       146  → 0146
                       6115 → 6115
                       7730 → 7730
                    */

                    kode =
                        kode.padStart(
                            4,
                            "0"
                        );


                    const option =
                        document.createElement(
                            "option"
                        );


                    /*
                       Value tetap menggunakan
                       format yang digunakan sistem
                       sebelumnya.
                    */

                    option.value =
                        kode +
                        "-" +
                        item.nama;


                    option.textContent =
                        kode +
                        "-" +
                        item.nama;


                    cabangSelect.appendChild(
                        option
                    );

                }
            );

        }


        /* =====================================
           JENIS KENDALA
        ===================================== */

        const kendalaSelect =
            document.getElementById(
                "jenis_kendala"
            );


        if (kendalaSelect) {

            kendalaSelect.innerHTML =
                '<option value="">Pilih Jenis Kendala</option>';


            data.kendala.forEach(
                function (item) {

                    const nama =
                        String(
                            item.nama || ""
                        ).trim();


                    if (!nama) {
                        return;
                    }


                    const option =
                        document.createElement(
                            "option"
                        );


                    option.value =
                        nama;


                    option.textContent =
                        nama;


                    kendalaSelect.appendChild(
                        option
                    );

                }
            );

        }


        console.log(
            "MASTER_DATA berhasil dimuat:",
            data
        );


    } catch (error) {

        console.error(
            "Gagal mengambil MASTER_DATA:",
            error
        );

    }

}


/* =========================================
   GENERATE KODE ORDER
========================================= */

function generateOrderNumber() {

    const randomNumber =
        Math.floor(
            100000 + Math.random() * 900000
        );

    const kodeOrder =
        "SOW-" + randomNumber;

    document
        .getElementById("kode")
        .textContent = kodeOrder;
}


/* =========================================
   TAMPILKAN PESAN
========================================= */

function showMessage(message, type) {

    const messageBox =
        document.getElementById("success");

    if (type === "success") {

        messageBox.innerHTML =
            '<div class="success-message">' +
            message +
            '</div>';

    } else {

        messageBox.innerHTML =
            '<div class="error-message">' +
            message +
            '</div>';
    }
}


/* =========================================
   BUAT PESAN WHATSAPP
========================================= */

function createWhatsAppMessage(data) {

    return `Hallo Admin,

Saya ingin melaporkan kendala dengan detail berikut:

📌 KODE ORDER : ${data.kode}

👤 Nama : ${data.nama}
🆔 NIP : ${data.nip}
🏢 Cabang : ${data.kode_cabang}
⚠️ Kendala : ${data.jenis_kendala}

📝 DESKRIPSI:
${data.deskripsi}

📱 WhatsApp : ${data.whatsapp}
📅 Tanggal : ${data.tanggal}
⏰ Jam : ${data.jam}`;
}


/* =========================================
   HALAMAN DIMUAT
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        generateOrderNumber();


        /* =====================================
           LOAD MASTER DATA
        ===================================== */

        await loadMasterData();


        const orderForm =
            document.getElementById("orderForm");

        const submitBtn =
            document.getElementById("submitBtn");


        /* =====================================
           SUBMIT FORM
        ===================================== */

        orderForm.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();


                /* Validasi */

                if (!orderForm.checkValidity()) {

                    orderForm.reportValidity();

                    return;
                }


                /* Ambil data */

                const formData = {

                    kode:
                        document
                            .getElementById("kode")
                            .textContent
                            .trim(),

                    nama:
                        document
                            .getElementById("nama")
                            .value
                            .trim(),

                    nip:
                        document
                            .getElementById("nip")
                            .value
                            .trim(),

                    kode_cabang:
                        document
                            .getElementById("kode_cabang")
                            .value,

                    jenis_kendala:
                        document
                            .getElementById("jenis_kendala")
                            .value,

                    deskripsi:
                        document
                            .getElementById("deskripsi")
                            .value
                            .trim(),

                    whatsapp:
                        document
                            .getElementById("whatsapp")
                            .value
                            .trim(),

                    tanggal:
                        document
                            .getElementById("tanggal")
                            .value,

                    jam:
                        document
                            .getElementById("jam")
                            .value
                };


                /* =====================================
                   BUAT LINK WHATSAPP
                ===================================== */

                const pesan =
                    createWhatsAppMessage(formData);

                const encodedMessage =
                    encodeURIComponent(pesan);

                const waURL =
                    "https://wa.me/" +
                    NOMOR_ADMIN +
                    "?text=" +
                    encodedMessage;


                /*
                   Buka WhatsApp SEKARANG.

                   Dilakukan sebelum await fetch
                   supaya tidak diblokir popup blocker.
                */

                window.open(
                    waURL,
                    "_blank"
                );


                /* Tombol loading */

                submitBtn.disabled = true;

                submitBtn.textContent =
                    "MENGIRIM...";


                showMessage(
                    "Sedang mengirim order...",
                    "success"
                );


                /* =====================================
                   KIRIM KE GOOGLE SPREADSHEET
                ===================================== */

                try {

                    await fetch(
                        WEB_APP_URL,
                        {

                            method: "POST",

                            mode: "no-cors",

                            headers: {

                                "Content-Type":
                                    "text/plain"

                            },

                            body:
                                JSON.stringify(formData)

                        }
                    );


                    /* =====================================
                       BERHASIL
                    ===================================== */

                    showMessage(
                        "✓ Order berhasil disimpan dan WhatsApp Admin dibuka!",
                        "success"
                    );


                    /* Reset Form */

                    orderForm.reset();


                    /* Kode baru */

                    generateOrderNumber();


                } catch (error) {

                    console.error(error);


                    showMessage(
                        "✕ Terjadi kesalahan saat mengirim ke Spreadsheet!",
                        "error"
                    );

                } finally {

                    submitBtn.disabled = false;

                    submitBtn.textContent =
                        "KIRIM ORDER";

                }

            }
        );

    }
);