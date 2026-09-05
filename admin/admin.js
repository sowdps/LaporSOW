// =====================================================
// ADMIN DASHBOARD - LAPOR SOW
// =====================================================


// =====================================================
// URL GOOGLE APPS SCRIPT WEB APP
// =====================================================

const API_URL =
    "https://script.google.com/macros/s/AKfycbwYxv-EGnZeeoKU7zOeiQSbLuprMfWPub3ICczLS3U1h8AEMG1JlEXcOCq6_06d7WmrWg/exec";
// =====================================================
// TAHAP 10
// TOKEN LOGIN ADMIN
// =====================================================

const ADMIN_TOKEN =
    localStorage.getItem(
        "MY_SOW_ADMIN_TOKEN"
    );


if (
    !ADMIN_TOKEN
) {

    window.location.replace(
        "login.html"
    );

}

// =====================================================
// AMBIL ELEMENT HTML
// =====================================================

const searchOrder =
    document.getElementById("searchOrder");

const filterCabang =
    document.getElementById("filterCabang");
// =====================================================
// FILTER RENTANG TANGGAL
// =====================================================

const filterTanggalMulai =
    document.getElementById(
        "filterTanggalMulai"
    );

const filterTanggalSampai =
    document.getElementById(
        "filterTanggalSampai"
    );


const searchButton =
    document.getElementById("searchButton");

const resetFilter =
    document.getElementById("resetFilter");

const orderTableBody =
    document.getElementById("orderTableBody");

const totalOrder =
    document.getElementById("totalOrder");

const totalOpen =
    document.getElementById("totalOpen");

const totalProses =
    document.getElementById("totalProses");

const totalSelesai =
    document.getElementById("totalSelesai");
// =====================================================
// ELEMENT MODAL DETAIL
// =====================================================

const detailModal =
    document.getElementById("detailModal");

const closeModal =
    document.getElementById("closeModal");

const closeModalButton =
    document.getElementById("closeModalButton");

const detailKode =
    document.getElementById("detailKode");

const detailNama =
    document.getElementById("detailNama");

const detailNip =
    document.getElementById("detailNip");

const detailCabang =
    document.getElementById("detailCabang");

const detailJenisKendala =
    document.getElementById("detailJenisKendala");

const detailDeskripsi =
    document.getElementById("detailDeskripsi");

const detailWhatsapp =
    document.getElementById("detailWhatsapp");

const detailTanggal =
    document.getElementById("detailTanggal");

const detailJam =
    document.getElementById("detailJam");

const detailStatus =
    document.getElementById("detailStatus");

const detailTeknisi =
    document.getElementById("detailTeknisi");

const detailCatatan =
    document.getElementById("detailCatatan");

const detailTanggalUpdate =
    document.getElementById("detailTanggalUpdate");

const detailRiwayat =
    document.getElementById("detailRiwayat");
// =====================================================
// ELEMENT UPDATE ORDER
// =====================================================

const updateStatus =
    document.getElementById(
        "updateStatus"
    );

const updateTeknisi =
    document.getElementById(
        "updateTeknisi"
    );
const updateCatatan =
    document.getElementById(
        "updateCatatan"
    );

const saveUpdateButton =
    document.getElementById(
        "saveUpdateButton"
    );
// =====================================================
// DATA SEMUA ORDER
// =====================================================

let semuaOrders = [];
let orderAktif = null;


// =====================================================
// SAAT HALAMAN PERTAMA KALI DIBUKA
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "Admin Dashboard berhasil dimuat"
        );

        loadOrders();

    }
);


// =====================================================
// FUNGSI LOAD ORDER
// =====================================================

async function loadOrders() {

    try {

        // =============================================
        // TAMPILKAN LOADING
        // =============================================

        orderTableBody.innerHTML = `

            <tr>

                <td colspan="9">

                    Memuat data order...

                </td>

            </tr>

        `;


        // =============================================
        // AMBIL NILAI FILTER
        // =============================================

        const kode =
            searchOrder.value.trim();

        const cabang =
            filterCabang.value.trim()
        // =============================================
        // AMBIL NILAI FILTER RENTANG TANGGAL
        // =============================================

        const tanggalMulai =
            filterTanggalMulai.value;

        const tanggalSampai =
            filterTanggalSampai.value;
        // =============================================
        // BUAT URL API
        // =============================================

        let url =
            API_URL;


        const params =
            new URLSearchParams();

        params.append(
            "token",
            ADMIN_TOKEN
        );
        // FILTER KODE

        if (kode !== "") {

            params.append(
                "kode",
                kode
            );

        }
        // =============================================
        // FILTER TANGGAL MULAI
        // =============================================

        if (tanggalMulai !== "") {

            params.append(
                "tanggalMulai",
                tanggalMulai
            );

        }


        // =============================================
        // FILTER TANGGAL SAMPAI
        // =============================================

        if (tanggalSampai !== "") {

            params.append(
                "tanggalSampai",
                tanggalSampai
            );

        }

        // FILTER CABANG

        if (cabang !== "") {

            params.append(
                "cabang",
                cabang
            );

        }


        // =============================================
        // TAMBAHKAN PARAMETER KE URL
        // =============================================

        if (
            params.toString() !== ""
        ) {

            url +=
                "?" +
                params.toString();

        }


        console.log(
            "URL API:",
            url
        );


        // =============================================
        // REQUEST KE GOOGLE APPS SCRIPT
        // =============================================

        const response =
            await fetch(url);


        if (!response.ok) {

            throw new Error(
                "Gagal menghubungkan ke API"
            );

        }


        const result =
            await response.json();


        console.log(
            "HASIL API:",
            result
        );


        // =============================================
        // CEK RESPONSE
        // =============================================

        if (
            !result.success
        ) {

            throw new Error(
                result.message ||
                "Gagal mengambil data"
            );

        }


        // =============================================
        // SIMPAN DATA
        // =============================================

        semuaOrders =
            result.orders || [];


        // =============================================
        // UPDATE STATISTIK
        // =============================================

        updateStatistics(
            result.statistik || {
                total: 0,
                open: 0,
                proses: 0,
                selesai: 0
            }
        );


        // =============================================
        // TAMPILKAN TABEL
        // =============================================

        renderOrders(
            semuaOrders
        );


    }

    catch (error) {

        console.error(
            "ERROR LOAD ORDER:",
            error
        );


        orderTableBody.innerHTML = `

            <tr>

                <td colspan="9">

                    ❌ Gagal memuat data:
                    ${error.message}

                </td>

            </tr>

        `;


        // RESET STATISTIK

        totalOrder.textContent = "0";

        totalOpen.textContent = "0";

        totalProses.textContent = "0";

        totalSelesai.textContent = "0";

    }

}


// =====================================================
// RENDER DATA KE TABEL
// =====================================================

function renderOrders(orders) {

    // =============================================
    // JIKA TIDAK ADA DATA
    // =============================================

    if (
        !orders ||
        orders.length === 0
    ) {

        orderTableBody.innerHTML = `

            <tr>

                <td colspan="9">

                    Belum ada data order

                </td>

            </tr>

        `;

        return;

    }


    // =============================================
    // KOSONGKAN TABEL
    // =============================================

    orderTableBody.innerHTML = "";


    // =============================================
    // LOOP DATA ORDER
    // =============================================

    orders.forEach(
        function (
            order,
            index
        ) {


            const tr =
                document.createElement(
                    "tr"
                );


            // =========================================
            // STATUS
            // =========================================

            const status =
                order.status ||
                "OPEN";


            // =========================================
            // ISI TABEL
            // =========================================

            tr.innerHTML = `

                <td>

                    ${index + 1}

                </td>


                <td>

                    ${escapeHtml(
                order.kode
            )}

                </td>


                <td>

                    ${escapeHtml(
                order.nama
            )}

                </td>


                <td>

                    ${escapeHtml(
                order.kode_cabang
            )}

                </td>


                <td>

                    ${escapeHtml(
                order.jenis_kendala
            )}

                </td>


                <td>

                    ${escapeHtml(
                formatTanggalTampilan(
                    order.tanggal
                )
            )}

                </td>


                <td>

                    <span class="status ${status.toLowerCase()}">

                        ${escapeHtml(
                status
            )}

                    </span>

                </td>


                <td>

                    ${escapeHtml(
                order.teknisi || "-"
            )}

                </td>


                <td>

                    <button
                        class="btn-detail"
                        onclick="lihatDetail('${escapeAttribute(order.kode)}')">

                        Detail

                    </button>

                </td>

            `;


            // =========================================
            // MASUKKAN KE TABEL
            // =========================================

            orderTableBody.appendChild(
                tr
            );


        }
    );

}


// =====================================================
// UPDATE STATISTIK
// =====================================================

// =====================================================
// UPDATE STATISTIK
// =====================================================

function updateStatistics(statistik) {

    // TOTAL ORDER
    totalOrder.textContent =
        statistik.total || 0;


    // OPEN
    totalOpen.textContent =
        statistik.open || 0;


    // PROSES
    totalProses.textContent =
        statistik.proses || 0;


    // SELESAI
    totalSelesai.textContent =
        statistik.selesai || 0;

}


// =====================================================
// TOMBOL CARI
// =====================================================

searchButton.addEventListener(
    "click",
    function () {

        console.log(
            "Tombol Cari ditekan"
        );

        loadOrders();

    }
);


// =====================================================
// TEKAN ENTER UNTUK MENCARI
// =====================================================

searchOrder.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Enter"
        ) {

            event.preventDefault();

            loadOrders();

        }

    }
);


// =====================================================
// FILTER CABANG
// =====================================================

filterCabang.addEventListener(
    "change",
    function () {

        loadOrders();

    }
);
// =====================================================
// FILTER TANGGAL MULAI
// =====================================================

filterTanggalMulai.addEventListener(
    "change",
    function () {

        loadOrders();

    }
);


// =====================================================
// FILTER TANGGAL SAMPAI
// =====================================================

filterTanggalSampai.addEventListener(
    "change",
    function () {

        loadOrders();

    }
);

// =====================================================
// RESET FILTER
// =====================================================

resetFilter.addEventListener(
    "click",
    function () {


        // KOSONGKAN KODE

        searchOrder.value =
            "";


        // RESET CABANG

        filterCabang.value =
            "";
        // =============================================
        // RESET RENTANG TANGGAL
        // =============================================

        filterTanggalMulai.value =
            "";

        filterTanggalSampai.value =
            "";

        console.log(
            "Filter direset"
        );


        // LOAD SEMUA DATA

        loadOrders();


    }
);


// =====================================================
// FUNGSI LIHAT DETAIL
// =====================================================

// =====================================================
// FUNGSI LIHAT DETAIL
// =====================================================

function lihatDetail(kode) {

    const order =
        semuaOrders.find(
            function (item) {

                return String(
                    item.kode
                ) === String(
                    kode
                );

            }
        );


    // =============================================
    // JIKA DATA TIDAK DITEMUKAN
    // =============================================

    if (!order) {

        alert(
            "Data order tidak ditemukan"
        );

        return;

    }
    // SIMPAN ORDER YANG SEDANG DIBUKA

    orderAktif = order;
    // =============================================
    // ISI DATA KE MODAL
    // =============================================
    detailKode.textContent =
        order.kode || "-";


    detailNama.textContent =
        order.nama || "-";


    detailNip.textContent =
        order.nip || "-";


    detailCabang.textContent =
        order.kode_cabang || "-";


    detailJenisKendala.textContent =
        order.jenis_kendala || "-";


    detailDeskripsi.textContent =
        order.deskripsi || "-";


    detailWhatsapp.textContent =
        order.whatsapp || "-";

    detailTanggal.textContent =
        formatTanggalTampilan(
            order.tanggal
        );


    detailJam.textContent =
        order.jam || "-";


    detailStatus.textContent =
        order.status || "OPEN";


    detailTeknisi.textContent =
        order.teknisi || "-";
    // =============================================
    // ISI STATUS UPDATE
    // =============================================

    updateStatus.value =
        order.status || "OPEN";


    // =============================================
    // ISI TEKNISI UPDATE
    // =============================================

    const teknisiSekarang =
        order.teknisi || "";


    // CEK APAKAH TEKNISI SUDAH ADA
    // DI DALAM PILIHAN

    let teknisiAda =
        false;


    Array.from(
        updateTeknisi.options
    ).forEach(
        function (option) {

            if (
                option.value === teknisiSekarang
            ) {

                teknisiAda =
                    true;

            }

        }
    );


    // JIKA BELUM ADA,
    // TAMBAHKAN OTOMATIS

    if (
        teknisiSekarang !== "" &&
        teknisiSekarang !== "-" &&
        !teknisiAda
    ) {

        const option =
            document.createElement(
                "option"
            );

        option.value =
            teknisiSekarang;

        option.textContent =
            teknisiSekarang;

        updateTeknisi.appendChild(
            option
        );

    }


    // PILIH TEKNISI SEKARANG

    updateTeknisi.value =
        teknisiSekarang;


    detailCatatan.textContent =
        order.catatan_progres || "-";


    detailTanggalUpdate.textContent =
        order.tanggal_update || "-";


    // =============================================
    // RIWAYAT STATUS
    // =============================================

    renderRiwayatTimeline(
        order.riwayat_status
    );


    // =============================================
    // TAMPILKAN MODAL
    // =============================================

    detailModal.classList.add(
        "show"
    );

}
// =====================================================
// FORMAT RIWAYAT STATUS
// =====================================================

// =====================================================
// FORMAT RIWAYAT STATUS
// =====================================================

function formatRiwayatStatus(riwayat) {

    // =============================================
    // JIKA TIDAK ADA RIWAYAT
    // =============================================

    if (
        riwayat === null ||
        riwayat === undefined ||
        riwayat === ""
    ) {

        return "Belum ada riwayat status";

    }


    // =============================================
    // JIKA DATA BERUPA ARRAY
    // =============================================

    if (
        Array.isArray(riwayat)
    ) {

        if (
            riwayat.length === 0
        ) {

            return "Belum ada riwayat status";

        }

        return riwayat.join("\n");

    }


    // =============================================
    // JIKA DATA BERUPA OBJECT
    // =============================================

    if (
        typeof riwayat === "object"
    ) {

        try {

            return JSON.stringify(
                riwayat,
                null,
                2
            );

        }

        catch (error) {

            return String(
                riwayat
            );

        }

    }


    // =============================================
    // JIKA DATA BERUPA TEXT
    // =============================================

    return String(
        riwayat
    );

}



// =====================================================
// TAHAP 4.9
// RENDER TIMELINE RIWAYAT STATUS
// =====================================================

function renderRiwayatTimeline(riwayat) {


    // =============================================
    // CEK ELEMENT
    // =============================================

    if (!detailRiwayat) {

        console.warn(
            "Element detailRiwayat tidak ditemukan"
        );

        return;

    }


    // =============================================
    // FORMAT RIWAYAT
    // =============================================

    const riwayatText =
        formatRiwayatStatus(
            riwayat
        );


    // =============================================
    // JIKA BELUM ADA RIWAYAT
    // =============================================

    if (
        !riwayatText ||
        riwayatText ===
        "Belum ada riwayat status"
    ) {

        detailRiwayat.innerHTML = `

            <div class="timeline-empty">

                Belum ada riwayat progres

            </div>

        `;

        return;

    }


    // =============================================
    // PECAH RIWAYAT PER BARIS
    // =============================================

    const daftarRiwayat =
        String(
            riwayatText
        )
            .split("\n")
            .map(
                function (item) {

                    return item.trim();

                }
            )
            .filter(
                function (item) {

                    return item !== "";

                }
            );


    // =============================================
    // JIKA DATA KOSONG
    // =============================================

    if (
        daftarRiwayat.length === 0
    ) {

        detailRiwayat.innerHTML = `

            <div class="timeline-empty">

                Belum ada riwayat progres

            </div>

        `;

        return;

    }


    // =============================================
    // BUAT HTML TIMELINE
    // =============================================

    let html =
        `<div class="riwayat-timeline">`;


    // =============================================
    // LOOP RIWAYAT
    // =============================================

    daftarRiwayat.forEach(
        function (item) {


            // =========================================
            // STATUS DEFAULT
            // =========================================

            let status =
                "OPEN";


            // =========================================
            // DETEKSI STATUS
            // =========================================

            const itemUpper =
                item.toUpperCase();


            if (
                itemUpper.includes(
                    "SELESAI"
                )
            ) {

                status =
                    "SELESAI";

            }

            else if (
                itemUpper.includes(
                    "PROSES"
                )
            ) {

                status =
                    "PROSES";

            }

            else if (
                itemUpper.includes(
                    "OPEN"
                )
            ) {

                status =
                    "OPEN";

            }


            // =========================================
            // CLASS STATUS
            // =========================================

            const statusClass =
                status.toLowerCase();


            // =========================================
            // AMBIL TANGGAL / WAKTU
            // =========================================

            let waktu =
                "";


            const waktuMatch =
                item.match(
                    /\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2}:\d{2}/
                );


            if (
                waktuMatch
            ) {

                waktu =
                    waktuMatch[0];

            }


            // =========================================
            // BERSIHKAN DETAIL
            // =========================================

            let detail =
                item;


            if (
                waktu !== ""
            ) {

                detail =
                    detail.replace(
                        waktu,
                        ""
                    );

            }


            // =========================================
            // BERSIHKAN KARAKTER AWAL
            // =========================================

            detail =
                detail
                    .replace(
                        /^OPEN\s*[-→]?\s*/i,
                        ""
                    )
                    .replace(
                        /^PROSES\s*[-→]?\s*/i,
                        ""
                    )
                    .replace(
                        /^SELESAI\s*[-→]?\s*/i,
                        ""
                    )
                    .trim();


            detail =
                detail.replace(
                    /^[-→\s]+/,
                    ""
                );


            // =========================================
            // TAMBAHKAN TIMELINE
            // =========================================

            html += `

                <div
                    class="timeline-item ${statusClass}"
                >

                    <div
                        class="timeline-marker"
                    >

                        <div
                            class="timeline-dot"
                        ></div>

                        <div
                            class="timeline-line"
                        ></div>

                    </div>


                    <div
                        class="timeline-content"
                    >

                        <div
                            class="
                                timeline-status
                                ${statusClass}
                            "
                        >

                            ${escapeHtml(
                status
            )}

                        </div>


                        ${waktu !== ""

                    ?

                    `

                            <div
                                class="timeline-time"
                            >

                                ${escapeHtml(
                        waktu
                    )}

                            </div>

                            `

                    :

                    ""

                }


                        ${detail !== ""

                    ?

                    `

                            <div
                                class="timeline-detail"
                            >

                                ${escapeHtml(
                        detail
                    )}

                            </div>

                            `

                    :

                    ""

                }

                    </div>

                </div>

            `;


        }
    );


    // =============================================
    // TUTUP TIMELINE
    // =============================================

    html +=
        `</div>`;


    // =============================================
    // TAMPILKAN TIMELINE
    // =============================================

    detailRiwayat.innerHTML =
        html;

}
// =====================================================
// TUTUP MODAL
// =====================================================

function tutupModal() {

    detailModal.classList.remove(
        "show"
    );

}


// =====================================================
// TOMBOL X
// =====================================================

closeModal.addEventListener(
    "click",
    function () {

        tutupModal();

    }
);


// =====================================================
// TOMBOL TUTUP
// =====================================================

closeModalButton.addEventListener(
    "click",
    function () {

        tutupModal();

    }
);


// =====================================================
// KLIK AREA LUAR MODAL
// =====================================================

detailModal.addEventListener(
    "click",
    function (event) {

        if (
            event.target === detailModal
        ) {

            tutupModal();

        }

    }
);


// =====================================================
// TOMBOL ESC
// =====================================================

document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Escape"
        ) {

            tutupModal();

        }

    }
);

// =====================================================
// FORMAT TANGGAL UNTUK TAMPILAN DASHBOARD
// =====================================================

// =====================================================
// FORMAT TANGGAL UNTUK TAMPILAN DASHBOARD
// MENGGUNAKAN WAKTU INDONESIA / BALI
// =====================================================

function formatTanggalTampilan(value) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {

        return "-";

    }

    const text =
        String(value).trim();

    // =============================================
    // JIKA SUDAH FORMAT yyyy-MM-dd
    // =============================================

    if (
        /^\d{4}-\d{2}-\d{2}$/.test(text)
    ) {

        return text;

    }

    // =============================================
    // JIKA DATA DARI API BERUPA ISO UTC
    //
    // Contoh:
    // 2026-08-30T16:00:00.000Z
    //
    // Waktu tersebut = 31/08/2026 00:00
    // waktu Indonesia bagian tengah
    // =============================================

    if (
        /^\d{4}-\d{2}-\d{2}T/.test(text)
    ) {

        const date =
            new Date(text);

        if (
            !isNaN(date.getTime())
        ) {

            const formatter =
                new Intl.DateTimeFormat(
                    "en-CA",
                    {
                        timeZone:
                            "Asia/Makassar",

                        year:
                            "numeric",

                        month:
                            "2-digit",

                        day:
                            "2-digit"
                    }
                );

            return formatter.format(date);

        }

    }

    // =============================================
    // JIKA FORMAT LAIN
    // =============================================

    return text;

}
// =====================================================
// AMANKAN TEXT HTML
// =====================================================

function escapeHtml(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)

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


// =====================================================
// AMANKAN ATTRIBUTE HTML
// =====================================================

function escapeAttribute(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)

        .replace(
            /'/g,
            "\\'"
        )

        .replace(
            /"/g,
            "&quot;"
        );

}
// =====================================================
// AMBIL TANGGAL UPDATE SAAT INI
// =====================================================

function getTanggalUpdate() {

    const sekarang =
        new Date();


    const tanggal =
        String(
            sekarang.getDate()
        ).padStart(
            2,
            "0"
        );


    const bulan =
        String(
            sekarang.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const tahun =
        sekarang.getFullYear();


    const jam =
        String(
            sekarang.getHours()
        ).padStart(
            2,
            "0"
        );


    const menit =
        String(
            sekarang.getMinutes()
        ).padStart(
            2,
            "0"
        );


    const detik =
        String(
            sekarang.getSeconds()
        ).padStart(
            2,
            "0"
        );


    return (
        tanggal +
        "/" +
        bulan +
        "/" +
        tahun +
        " " +
        jam +
        ":" +
        menit +
        ":" +
        detik
    );

}
// =====================================================
// SIMPAN UPDATE
// TAHAP 4.8
//
// SIMPAN KE GOOGLE SPREADSHEET
// MELALUI GOOGLE APPS SCRIPT
// =====================================================

saveUpdateButton.addEventListener(
    "click",
    async function () {

        // =============================================
        // CEK APAKAH ADA ORDER AKTIF
        // =============================================

        if (!orderAktif) {

            alert(
                "Silakan buka Detail Order terlebih dahulu"
            );

            return;

        }



        // =============================================
        // AMBIL STATUS LAMA
        // =============================================

        const statusLama =
            orderAktif.status || "OPEN";



        // =============================================
        // AMBIL STATUS BARU
        // =============================================

        const statusBaru =
            updateStatus.value;



        // =============================================
        // AMBIL TEKNISI / SOW
        // =============================================

        const teknisiBaru =
            updateTeknisi.value;



        // =============================================
        // AMBIL CATATAN PROGRES
        // =============================================

        const catatanBaru =
            updateCatatan.value.trim();



        // =============================================
        // VALIDASI
        // =============================================

        if (
            statusBaru === ""
        ) {

            alert(
                "Status wajib dipilih"
            );

            return;

        }



        // =============================================
        // KONFIRMASI
        // =============================================

        const konfirmasi =
            confirm(

                "Simpan update order?\n\n" +

                "Kode Order: " +
                orderAktif.kode +

                "\nStatus: " +
                statusLama +
                " → " +
                statusBaru +

                "\nTeknisi/SOW: " +
                (
                    teknisiBaru || "-"
                )

            );



        if (!konfirmasi) {

            return;

        }



        // =============================================
        // NONAKTIFKAN TOMBOL
        // =============================================

        const textButton =
            saveUpdateButton.textContent;



        saveUpdateButton.disabled =
            true;



        saveUpdateButton.textContent =
            "Menyimpan...";



        try {



            // =========================================
            // DATA YANG DIKIRIM KE GOOGLE APPS SCRIPT
            // =========================================

            const payload = {

                action:
                    "updateOrder",

                kode:
                    orderAktif.kode,

                status:
                    statusBaru,

                teknisi:
                    teknisiBaru,

                catatan_progres:
                    catatanBaru,

                status_lama:
                    statusLama,

                token:
                    ADMIN_TOKEN

            };



            console.log(
                "KIRIM UPDATE:",
                payload
            );



            // =========================================
            // KIRIM POST KE API
            // =========================================

            const response =
                await fetch(

                    API_URL,

                    {

                        method:
                            "POST",

                        headers: {

                            "Content-Type":
                                "text/plain;charset=utf-8"

                        },

                        body:
                            JSON.stringify(
                                payload
                            )

                    }

                );



            // =========================================
            // AMBIL RESPONSE
            // =========================================

            const result =
                await response.json();



            console.log(
                "HASIL UPDATE API:",
                result
            );



            // =========================================
            // CEK ERROR DARI SERVER
            // =========================================

            if (
                !result.success
            ) {

                throw new Error(

                    result.message ||
                    "Gagal menyimpan update"

                );

            }



            // =========================================
            // UPDATE DATA LOKAL
            // =============================================

            orderAktif.status =
                result.status ||
                statusBaru;



            orderAktif.teknisi =
                result.teknisi !== undefined
                    ? result.teknisi
                    : teknisiBaru;



            orderAktif.catatan_progres =
                result.catatan_progres !== undefined
                    ? result.catatan_progres
                    : catatanBaru;



            // =========================================
            // JIKA SERVER MENGIRIM TANGGAL UPDATE
            // =========================================

            if (
                result.tanggal_update
            ) {

                orderAktif.tanggal_update =
                    result.tanggal_update;

            }



            // =========================================
            // JIKA SERVER MENGIRIM RIWAYAT
            // =========================================

            if (
                result.riwayat_status
            ) {

                orderAktif.riwayat_status =
                    result.riwayat_status;

            }



            // =========================================
            // UPDATE TAMPILAN DETAIL
            // =========================================

            detailStatus.textContent =
                orderAktif.status ||
                "OPEN";



            detailTeknisi.textContent =
                orderAktif.teknisi ||
                "-";



            detailCatatan.textContent =
                orderAktif.catatan_progres ||
                "-";



            detailTanggalUpdate.textContent =
                orderAktif.tanggal_update ||
                "-";



            detailRiwayat.textContent =
                formatRiwayatStatus(
                    orderAktif.riwayat_status
                );



            // =========================================
            // REFRESH DATA DASHBOARD
            // =========================================

            await loadOrders();



            // =========================================
            // TAMPILKAN BERHASIL
            // =========================================

            alert(

                "Update berhasil disimpan!\n\n" +

                "Kode Order: " +
                orderAktif.kode +

                "\nStatus: " +
                statusLama +
                " → " +
                statusBaru +

                "\nTeknisi/SOW: " +
                (
                    teknisiBaru || "-"
                ) +

                "\n\nData sudah disimpan ke Spreadsheet."

            );



        }

        catch (error) {



            console.error(
                "ERROR UPDATE:",
                error
            );



            alert(

                "❌ Update gagal disimpan.\n\n" +

                error.message

            );



        }

        finally {



            // =========================================
            // AKTIFKAN KEMBALI TOMBOL
            // =========================================

            saveUpdateButton.disabled =
                false;



            saveUpdateButton.textContent =
                textButton;

        }

    }
);
// =====================================================
// TAHAP 10
// LOGOUT ADMIN
// =====================================================

const logoutButton =
    document.getElementById(
        "logoutButton"
    );


if (
    logoutButton
) {

    logoutButton.addEventListener(
        "click",
        async function () {

            const yakin =
                confirm(
                    "Apakah Anda yakin ingin logout?"
                );


            if (
                !yakin
            ) {

                return;

            }


            try {

                await fetch(
                    API_URL,
                    {

                        method:
                            "POST",

                        headers: {

                            "Content-Type":
                                "text/plain;charset=utf-8"

                        },

                        body:
                            JSON.stringify({

                                action:
                                    "logoutAdmin",

                                token:
                                    ADMIN_TOKEN

                            })

                    }
                );

            }

            catch (error) {

                console.error(
                    "ERROR LOGOUT:",
                    error
                );

            }


            // -----------------------------------------
            // HAPUS TOKEN
            // -----------------------------------------

            localStorage.removeItem(
                "MY_SOW_ADMIN_TOKEN"
            );


            // -----------------------------------------
            // KEMBALI KE LOGIN
            // -----------------------------------------

            window.location.replace(
                "login.html"
            );

        }
    );

}