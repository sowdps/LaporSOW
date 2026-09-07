// =====================================================
// ADMIN DASHBOARD - LAPOR SOW
// =====================================================


// =====================================================
// URL GOOGLE APPS SCRIPT WEB APP
// =====================================================

const API_URL =
    "https://script.google.com/macros/s/AKfycbyOcM6jK4OHqHwd7203Do9Za0W23ZpA4wfmvBd2UsqQT_7v359DkjKTxdeaEqjQlqhV/exec";
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
// TAHAP 15A.3
// AUTO LOGOUT ADMIN - 10 MENIT
// =====================================================

const ADMIN_IDLE_MINUTES =
    10;

const ADMIN_IDLE_MS =
    ADMIN_IDLE_MINUTES *
    60 *
    1000;


// -----------------------------------------------------
// WAKTU AKTIVITAS TERAKHIR
// -----------------------------------------------------

let adminLastActivity =
    Date.now();


// -----------------------------------------------------
// WAKTU TERAKHIR SERVER DIHUBUNGI
// -----------------------------------------------------

let adminLastServerTouch =
    0;


// -----------------------------------------------------
// TIMER AUTO LOGOUT
// -----------------------------------------------------

let adminIdleTimer =
    null;


// -----------------------------------------------------
// PENGAMAN AGAR LOGOUT TIDAK BERULANG
// -----------------------------------------------------

let adminLogoutInProgress =
    false;


// =====================================================
// FUNGSI LOGOUT OTOMATIS
// =====================================================

async function forceLogoutAdmin(
    alasan
) {

    if (
        adminLogoutInProgress
    ) {
        return;
    }

    adminLogoutInProgress =
        true;


    console.warn(
        "ADMIN LOGOUT:",
        alasan
    );


    // -------------------------------------------------
    // HAPUS TOKEN DARI BROWSER
    // -------------------------------------------------

    localStorage.removeItem(
        "MY_SOW_ADMIN_TOKEN"
    );


    // -------------------------------------------------
    // KEMBALI KE LOGIN
    // -------------------------------------------------

    window.location.replace(
        "login.html"
    );

}


// =====================================================
// RESET TIMER AKTIVITAS
// =====================================================

function resetAdminIdleTimer() {

    adminLastActivity =
        Date.now();


    if (
        adminIdleTimer
    ) {

        clearTimeout(
            adminIdleTimer
        );

    }


    adminIdleTimer =
        setTimeout(
            function () {

                forceLogoutAdmin(
                    "Tidak ada aktivitas selama 10 menit."
                );

            },
            ADMIN_IDLE_MS
        );

}


// =====================================================
// PERBARUI AKTIVITAS KE SERVER
// =====================================================

async function touchAdminSessionServer() {

    const sekarang =
        Date.now();


    // Jangan request terlalu sering
    if (
        sekarang -
        adminLastServerTouch
        <
        60000
    ) {

        return;

    }


    adminLastServerTouch =
        sekarang;


    try {

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
                        JSON.stringify({
                            action:
                                "touchAdminSession",

                            token:
                                ADMIN_TOKEN
                        })
                }
            );


        const result =
            await response.json();


        if (
            !result.success ||
            result.unauthorized
        ) {

            forceLogoutAdmin(
                result.message ||
                "Session admin sudah berakhir."
            );

        }

    }

    catch (error) {

        console.error(
            "Gagal memperbarui session:",
            error
        );

    }

}


// =====================================================
// CATAT AKTIVITAS ADMIN
// =====================================================

function catatAktivitasAdmin() {

    const sekarang =
        Date.now();


    // -----------------------------------------------
    // JIKA SUDAH MELEWATI 10 MENIT
    // -----------------------------------------------

    if (
        sekarang -
        adminLastActivity
        >=
        ADMIN_IDLE_MS
    ) {

        forceLogoutAdmin(
            "Session berakhir karena tidak ada aktivitas selama 10 menit."
        );

        return;

    }


    resetAdminIdleTimer();

    touchAdminSessionServer();

}


// =====================================================
// DETEKSI AKTIVITAS ADMIN
// =====================================================

[
    "click",
    "keydown",
    "scroll",
    "touchstart",
    "mousemove"
].forEach(
    function (eventName) {

        document.addEventListener(
            eventName,
            catatAktivitasAdmin,
            {
                passive: true
            }
        );

    }
);


// =====================================================
// CEK SAAT KEMBALI KE TAB
// =====================================================

document.addEventListener(
    "visibilitychange",
    function () {

        if (
            document.visibilityState ===
            "visible"
        ) {

            catatAktivitasAdmin();

        }

    }
);


// =====================================================
// MULAI TIMER
// =====================================================

resetAdminIdleTimer();


// =====================================================
// LOG TAHAP 15A.3
// =====================================================

console.log(
    "TAHAP 15A.3 - Auto Logout aktif: 10 menit"
);

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
// DATA REKAP TERAKHIR
// Digunakan untuk Download Excel
// =====================================================

let hasilRekapTerakhir = null;
let periodeRekapTerakhir = "";


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
// =====================================================
// B.2.3 - REKAP LAPORAN
// MENGAKTIFKAN PILIHAN PERIODE & TOMBOL REKAP
// =====================================================

const rekapPeriodButtons =
    document.querySelectorAll(
        ".rekap-period-button"
    );

const rekapPeriodForm =
    document.getElementById(
        "rekapPeriodForm"
    );

const tampilkanRekapButton =
    document.getElementById(
        "tampilkanRekapButton"
    );

const rekapResult =
    document.getElementById(
        "rekapResult"
    );


// =====================================================
// PERIODE AKTIF
// =====================================================

let periodeRekapAktif =
    "harian";


// =====================================================
// FUNGSI TAMPILKAN FORM PERIODE
// =====================================================

function tampilkanFormPeriode(
    periode
) {

    periodeRekapAktif =
        periode;


    // -------------------------------------------------
    // HARIAN
    // -------------------------------------------------

    if (
        periode === "harian"
    ) {

        rekapPeriodForm.innerHTML = `
            <div class="rekap-info">
                <strong>Periode Harian</strong>
                <span>Pilih tanggal laporan yang ingin direkap.</span>
            </div>

            <div class="rekap-input-group">
                <div class="rekap-input-item">
                    <label for="rekapTanggal">
                        Tanggal
                    </label>

                    <input
                        type="date"
                        id="rekapTanggal"
                    >
                </div>
            </div>
        `;

        return;
    }


    // -------------------------------------------------
    // MINGGUAN
    // -------------------------------------------------

    if (
        periode === "mingguan"
    ) {

        rekapPeriodForm.innerHTML = `
            <div class="rekap-info">
                <strong>Periode Mingguan</strong>
                <span>Pilih tanggal awal minggu dan tanggal akhir minggu.</span>
            </div>

            <div class="rekap-input-group">

                <div class="rekap-input-item">
                    <label for="rekapTanggalMulai">
                        Tanggal Mulai
                    </label>

                    <input
                        type="date"
                        id="rekapTanggalMulai"
                    >
                </div>

                <div class="rekap-input-item">
                    <label for="rekapTanggalSampai">
                        Tanggal Sampai
                    </label>

                    <input
                        type="date"
                        id="rekapTanggalSampai"
                    >
                </div>

            </div>
        `;

        return;
    }


    // -------------------------------------------------
    // BULANAN
    // -------------------------------------------------

    if (
        periode === "bulanan"
    ) {

        rekapPeriodForm.innerHTML = `
            <div class="rekap-info">
                <strong>Periode Bulanan</strong>
                <span>Pilih bulan dan tahun laporan.</span>
            </div>

            <div class="rekap-input-group">

                <div class="rekap-input-item">
                    <label for="rekapBulan">
                        Bulan
                    </label>

                    <select id="rekapBulan">

                        <option value="">
                            Pilih Bulan
                        </option>

                        <option value="01">
                            Januari
                        </option>

                        <option value="02">
                            Februari
                        </option>

                        <option value="03">
                            Maret
                        </option>

                        <option value="04">
                            April
                        </option>

                        <option value="05">
                            Mei
                        </option>

                        <option value="06">
                            Juni
                        </option>

                        <option value="07">
                            Juli
                        </option>

                        <option value="08">
                            Agustus
                        </option>

                        <option value="09">
                            September
                        </option>

                        <option value="10">
                            Oktober
                        </option>

                        <option value="11">
                            November
                        </option>

                        <option value="12">
                            Desember
                        </option>

                    </select>
                </div>


                <div class="rekap-input-item">
                    <label for="rekapTahun">
                        Tahun
                    </label>

                    <input
                        type="number"
                        id="rekapTahun"
                        min="2020"
                        max="2100"
                        placeholder="Contoh: 2026"
                    >
                </div>

            </div>
        `;

        return;
    }


    // -------------------------------------------------
    // TAHUNAN
    // -------------------------------------------------

    if (
        periode === "tahunan"
    ) {

        rekapPeriodForm.innerHTML = `
            <div class="rekap-info">
                <strong>Periode Tahunan</strong>
                <span>Pilih tahun laporan.</span>
            </div>

            <div class="rekap-input-group">

                <div class="rekap-input-item">
                    <label for="rekapTahun">
                        Tahun
                    </label>

                    <input
                        type="number"
                        id="rekapTahun"
                        min="2020"
                        max="2100"
                        placeholder="Contoh: 2026"
                    >
                </div>

            </div>
        `;

        return;
    }

}


// =====================================================
// KLIK PILIHAN PERIODE
// =====================================================

rekapPeriodButtons.forEach(
    function (button) {

        button.addEventListener(
            "click",
            function () {

                // Hapus active dari semua tombol
                rekapPeriodButtons.forEach(
                    function (btn) {
                        btn.classList.remove(
                            "active"
                        );
                    }
                );


                // Aktifkan tombol yang dipilih
                button.classList.add(
                    "active"
                );


                // Ambil periode
                const periode =
                    button.dataset.period;


                // Tampilkan form periode
                tampilkanFormPeriode(
                    periode
                );

            }
        );

    }
);


// =====================================================
// PERIODE DEFAULT
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        tampilkanFormPeriode(
            "harian"
        );

    }
);


// =====================================================
// TOMBOL TAMPILKAN REKAP
// =====================================================

if (
    tampilkanRekapButton
) {

    tampilkanRekapButton.addEventListener(
        "click",
        function () {

            console.log(
                "Periode Rekap:",
                periodeRekapAktif
            );
            // =====================================================
            // B.3.2.2
            // EVENT DOWNLOAD REKAP EXCEL
            // =====================================================

            const downloadRekapExcelButton =
                document.getElementById(
                    "downloadRekapExcelButton"
                );


            if (
                downloadRekapExcelButton
            ) {

                downloadRekapExcelButton.addEventListener(
                    "click",
                    downloadRekapExcel
                );

            }

            // -------------------------------------------------
            // HARIAN
            // -------------------------------------------------

            if (
                periodeRekapAktif ===
                "harian"
            ) {

                const tanggal =
                    document.getElementById(
                        "rekapTanggal"
                    )?.value;


                if (
                    !tanggal
                ) {

                    alert(
                        "Silakan pilih tanggal terlebih dahulu."
                    );

                    return;
                }


                ambilRekap(
                    "harian",
                    {
                        tanggal:
                            tanggal
                    }
                );

                return;
            }


            // -------------------------------------------------
            // MINGGUAN
            // -------------------------------------------------

            if (
                periodeRekapAktif ===
                "mingguan"
            ) {

                const tanggalMulai =
                    document.getElementById(
                        "rekapTanggalMulai"
                    )?.value;


                const tanggalSampai =
                    document.getElementById(
                        "rekapTanggalSampai"
                    )?.value;


                if (
                    !tanggalMulai ||
                    !tanggalSampai
                ) {

                    alert(
                        "Silakan pilih tanggal mulai dan tanggal sampai."
                    );

                    return;
                }


                if (
                    tanggalMulai >
                    tanggalSampai
                ) {

                    alert(
                        "Tanggal mulai tidak boleh lebih besar dari tanggal sampai."
                    );

                    return;
                }


                ambilRekap(
                    "mingguan",
                    {
                        tanggalMulai:
                            tanggalMulai,

                        tanggalSampai:
                            tanggalSampai
                    }
                );

                return;
            }


            // -------------------------------------------------
            // BULANAN
            // -------------------------------------------------

            if (
                periodeRekapAktif ===
                "bulanan"
            ) {

                const bulan =
                    document.getElementById(
                        "rekapBulan"
                    )?.value;


                const tahun =
                    document.getElementById(
                        "rekapTahun"
                    )?.value;


                if (
                    !bulan ||
                    !tahun
                ) {

                    alert(
                        "Silakan pilih bulan dan tahun."
                    );

                    return;
                }


                ambilRekap(
                    "bulanan",
                    {
                        bulan:
                            bulan,

                        tahun:
                            tahun
                    }
                );

                return;
            }


            // -------------------------------------------------
            // TAHUNAN
            // -------------------------------------------------

            if (
                periodeRekapAktif ===
                "tahunan"
            ) {

                const tahun =
                    document.getElementById(
                        "rekapTahun"
                    )?.value;


                if (
                    !tahun
                ) {

                    alert(
                        "Silakan pilih tahun."
                    );

                    return;
                }


                ambilRekap(
                    "tahunan",
                    {
                        tahun:
                            tahun
                    }
                );

            }

        }
    );

}


// =====================================================
// FUNGSI AMBIL DATA REKAP DARI API
// =====================================================

async function ambilRekap(
    periode,
    dataPeriode
) {

    try {

        rekapResult.innerHTML = `
            <div class="rekap-empty">
                ⏳
                <h3>Memuat Rekap...</h3>
                <p>Mohon tunggu.</p>
            </div>
        `;


        // =================================================
        // BUAT URL API
        // =================================================

        const params =
            new URLSearchParams();


        params.append(
            "token",
            ADMIN_TOKEN
        );


        params.append(
            "rekap",
            "true"
        );


        params.append(
            "tipe",
            periode
        );


        // Tambahkan parameter periode
        Object.keys(
            dataPeriode
        ).forEach(
            function (key) {

                params.append(
                    key,
                    dataPeriode[key]
                );

            }
        );


        const url =
            API_URL +
            "?" +
            params.toString();


        console.log(
            "URL API REKAP:",
            url
        );


        // =================================================
        // REQUEST API
        // =================================================

        const response =
            await fetch(
                url
            );


        if (
            !response.ok
        ) {

            throw new Error(
                "Gagal menghubungkan ke API Rekap."
            );

        }


        const result =
            await response.json();


        console.log(
            "HASIL API REKAP:",
            result
        );


        // =================================================
        // CEK RESPONSE
        // =================================================

        if (
            !result.success
        ) {

            throw new Error(
                result.message ||
                "Gagal mengambil data rekap."
            );

        }
        // =================================================
        // SIMPAN HASIL REKAP TERAKHIR
        // Untuk digunakan oleh Download Excel
        // =================================================

        hasilRekapTerakhir = result;
        periodeRekapTerakhir = periode;


        // =================================================
        // TAMPILKAN HASIL
        // =================================================

        tampilkanHasilRekap(
            result,
            periode
        );

    }

    catch (
    error
    ) {

        console.error(
            "ERROR REKAP:",
            error
        );


        rekapResult.innerHTML = `
            <div class="rekap-empty">

                ❌

                <h3>Rekap Gagal</h3>

                <p>
                    ${error.message}
                </p>

            </div>
        `;

    }

}

// =====================================================
// B.3.3.1
// DOWNLOAD EXCEL - LAPORAN PROFESIONAL BERWARNA
// =====================================================

async function downloadRekapExcel() {

    try {

        // -------------------------------------------------
        // VALIDASI
        // -------------------------------------------------

        if (!hasilRekapTerakhir) {
            alert("Silakan tampilkan rekap terlebih dahulu.");
            return;
        }

        if (typeof ExcelJS === "undefined") {
            alert(
                "Library ExcelJS belum berhasil dimuat.\n\n" +
                "Pastikan koneksi internet aktif lalu refresh halaman."
            );
            return;
        }

        const result = hasilRekapTerakhir;

        const statistik = result.statistik || {};

        const rekapCabang =
            Array.isArray(result.rekapCabang)
                ? result.rekapCabang
                : [];

        const rekapTeknisi =
            Array.isArray(result.rekapTeknisi)
                ? result.rekapTeknisi
                : [];

        const orders =
            Array.isArray(result.orders)
                ? result.orders
                : [];

        const periode = result.periode || {};

        // -------------------------------------------------
        // LABEL PERIODE
        // -------------------------------------------------

        const tipe = String(
            result.tipe ||
            periodeRekapTerakhir ||
            "bulanan"
        ).toLowerCase();

        const periodeLabelMap = {
            harian: "HARIAN",
            mingguan: "MINGGUAN",
            bulanan: "BULANAN",
            tahunan: "TAHUNAN"
        };

        const periodeLabel =
            periodeLabelMap[tipe] || tipe.toUpperCase();


        // -------------------------------------------------
        // FORMAT TANGGAL
        // -------------------------------------------------

        function formatTanggalIndonesia(tanggal) {

            if (!tanggal) return "-";

            const bagian =
                String(tanggal).split("-");

            if (bagian.length === 3) {
                return (
                    bagian[2] +
                    "/" +
                    bagian[1] +
                    "/" +
                    bagian[0]
                );
            }

            return String(tanggal);
        }


        // -------------------------------------------------
        // NAMA FILE
        // -------------------------------------------------

        const tanggalMulai =
            periode.mulai || "";

        const tanggalSampai =
            periode.sampai || "";

        const namaFile =
            "Laporan_SOW_IV_Denpasar_" +
            tipe +
            "_" +
            tanggalMulai +
            "_sampai_" +
            tanggalSampai +
            ".xlsx";


        // =================================================
        // BUAT WORKBOOK
        // =================================================

        const workbook = new ExcelJS.Workbook();

        workbook.creator = "SOW IV Denpasar";
        workbook.lastModifiedBy = "SOW IV Denpasar";
        workbook.created = new Date();
        workbook.modified = new Date();

        const worksheet =
            workbook.addWorksheet("Laporan SOW");


        // =================================================
        // WARNA DESAIN
        // =================================================

        const WARNA = {

            biruTua: "17365D",

            biru: "2F75B5",

            biruMuda: "D9EAF7",

            header: "4472C4",

            headerTabel: "5B9BD5",

            putih: "FFFFFF",

            hitam: "000000",

            abu: "D9E1F2",

            abuMuda: "F2F2F2",

            border: "B7B7B7",

            open: "FFF2CC",

            proses: "DDEBF7",

            selesai: "E2F0D9",

            ditolak: "F4CCCC"

        };


        // =================================================
        // FONT
        // =================================================

        const FONT_NORMAL = {
            name: "Calibri",
            size: 11,
            color: {
                argb: WARNA.hitam
            }
        };

        const FONT_BOLD = {
            name: "Calibri",
            size: 11,
            bold: true,
            color: {
                argb: WARNA.hitam
            }
        };


        // =================================================
        // BORDER
        // =================================================

        const BORDER = {
            top: {
                style: "thin",
                color: {
                    argb: WARNA.border
                }
            },

            left: {
                style: "thin",
                color: {
                    argb: WARNA.border
                }
            },

            bottom: {
                style: "thin",
                color: {
                    argb: WARNA.border
                }
            },

            right: {
                style: "thin",
                color: {
                    argb: WARNA.border
                }
            }
        };


        // =================================================
        // LEBAR KOLOM
        // =================================================

        worksheet.columns = [

            {
                key: "kode",
                width: 24
            },

            {
                key: "nama",
                width: 25
            },

            {
                key: "cabang",
                width: 24
            },

            {
                key: "kendala",
                width: 34
            },

            {
                key: "tanggal",
                width: 17
            },

            {
                key: "status",
                width: 16
            },

            {
                key: "teknisi",
                width: 28
            }

        ];


        // =================================================
        // JUDUL UTAMA
        // =================================================

        worksheet.mergeCells("A1:G1");

        const cellJudul =
            worksheet.getCell("A1");

        cellJudul.value =
            "LAPORAN DETAIL SOW IV DENPASAR";

        cellJudul.font = {
            name: "Calibri",
            size: 16,
            bold: true,
            color: {
                argb: WARNA.putih
            }
        };

        cellJudul.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: {
                argb: WARNA.biruTua
            }
        };

        cellJudul.alignment = {
            horizontal: "center",
            vertical: "middle"
        };

        cellJudul.border = BORDER;

        worksheet.getRow(1).height = 30;


        // =================================================
        // SUB JUDUL
        // =================================================

        worksheet.mergeCells("A2:G2");

        const cellSubJudul =
            worksheet.getCell("A2");

        cellSubJudul.value =
            "REKAP LAPORAN SOW";

        cellSubJudul.font = {
            name: "Calibri",
            size: 13,
            bold: true,
            color: {
                argb: WARNA.putih
            }
        };

        cellSubJudul.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: {
                argb: WARNA.biru
            }
        };

        cellSubJudul.alignment = {
            horizontal: "center",
            vertical: "middle"
        };

        cellSubJudul.border = BORDER;

        worksheet.getRow(2).height = 24;


        // =================================================
        // PERIODE
        // =================================================

        worksheet.getCell("A4").value = "PERIODE";
        worksheet.getCell("B4").value = ":";
        worksheet.getCell("C4").value = periodeLabel;

        worksheet.getCell("A5").value = "TANGGAL MULAI";
        worksheet.getCell("B5").value = ":";
        worksheet.getCell("C5").value =
            formatTanggalIndonesia(tanggalMulai);

        worksheet.getCell("A6").value = "TANGGAL SAMPAI";
        worksheet.getCell("B6").value = ":";
        worksheet.getCell("C6").value =
            formatTanggalIndonesia(tanggalSampai);


        for (let row = 4; row <= 6; row++) {

            const cellA =
                worksheet.getCell(`A${row}`);

            const cellB =
                worksheet.getCell(`B${row}`);

            const cellC =
                worksheet.getCell(`C${row}`);

            cellA.font = FONT_BOLD;

            cellA.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: {
                    argb: WARNA.biruMuda
                }
            };

            cellA.border = BORDER;
            cellB.border = BORDER;
            cellC.border = BORDER;

            cellB.alignment = {
                horizontal: "center"
            };

            cellC.font = {
                name: "Calibri",
                size: 11,
                bold: true,
                color: {
                    argb: WARNA.biruTua
                }
            };

            cellC.alignment = {
                horizontal: "left"
            };
        }


        // =================================================
        // STATISTIK
        // =================================================

        const statistikTitleRow = 8;

        worksheet.mergeCells(
            `A${statistikTitleRow}:G${statistikTitleRow}`
        );

        const statistikTitle =
            worksheet.getCell(
                `A${statistikTitleRow}`
            );

        statistikTitle.value =
            "STATISTIK LAPORAN";

        statistikTitle.font = {
            name: "Calibri",
            size: 12,
            bold: true,
            color: {
                argb: WARNA.putih
            }
        };

        statistikTitle.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: {
                argb: WARNA.header
            }
        };

        statistikTitle.alignment = {
            horizontal: "center",
            vertical: "middle"
        };

        statistikTitle.border = BORDER;


        // Header statistik

        worksheet.getCell("A9").value =
            "Keterangan";

        worksheet.getCell("B9").value =
            "Jumlah";

        for (let col = 1; col <= 2; col++) {

            const cell =
                worksheet.getCell(9, col);

            cell.font = {
                name: "Calibri",
                size: 11,
                bold: true,
                color: {
                    argb: WARNA.putih
                }
            };

            cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: {
                    argb: WARNA.headerTabel
                }
            };

            cell.alignment = {
                horizontal: "center",
                vertical: "middle"
            };

            cell.border = BORDER;
        }


        // Data statistik

        const dataStatistik = [

            ["Total Order", statistik.total || 0],

            ["OPEN", statistik.open || 0],

            ["PROSES", statistik.proses || 0],

            ["SELESAI", statistik.selesai || 0],

            ["DITOLAK", statistik.ditolak || 0]

        ];


        dataStatistik.forEach(
            (data, index) => {

                const rowNumber =
                    10 + index;

                worksheet.getCell(
                    `A${rowNumber}`
                ).value = data[0];

                worksheet.getCell(
                    `B${rowNumber}`
                ).value = data[1];

                for (let col = 1; col <= 2; col++) {

                    const cell =
                        worksheet.getCell(
                            rowNumber,
                            col
                        );

                    cell.font =
                        col === 1
                            ? FONT_BOLD
                            : FONT_NORMAL;

                    cell.border = BORDER;

                    cell.alignment = {
                        vertical: "middle",
                        horizontal:
                            col === 2
                                ? "center"
                                : "left"
                    };
                }


                // Warna status

                let fillColor = null;

                if (data[0] === "OPEN") {
                    fillColor = WARNA.open;
                }

                if (data[0] === "PROSES") {
                    fillColor = WARNA.proses;
                }

                if (data[0] === "SELESAI") {
                    fillColor = WARNA.selesai;
                }

                if (data[0] === "DITOLAK") {
                    fillColor = WARNA.ditolak;
                }

                if (fillColor) {

                    worksheet.getCell(
                        `A${rowNumber}`
                    ).fill = {
                        type: "pattern",
                        pattern: "solid",
                        fgColor: {
                            argb: fillColor
                        }
                    };

                    worksheet.getCell(
                        `B${rowNumber}`
                    ).fill = {
                        type: "pattern",
                        pattern: "solid",
                        fgColor: {
                            argb: fillColor
                        }
                    };
                }

            }
        );


        // =================================================
        // REKAP CABANG
        // =================================================

        const cabangTitleRow = 16;

        worksheet.mergeCells(
            `A${cabangTitleRow}:G${cabangTitleRow}`
        );

        const cabangTitle =
            worksheet.getCell(
                `A${cabangTitleRow}`
            );

        cabangTitle.value =
            "REKAP BERDASARKAN CABANG";

        cabangTitle.font = {
            name: "Calibri",
            size: 12,
            bold: true,
            color: {
                argb: WARNA.putih
            }
        };

        cabangTitle.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: {
                argb: WARNA.header
            }
        };

        cabangTitle.alignment = {
            horizontal: "center",
            vertical: "middle"
        };

        cabangTitle.border = BORDER;


        worksheet.getCell("A17").value =
            "Cabang";

        worksheet.getCell("B17").value =
            "Jumlah";


        for (let col = 1; col <= 2; col++) {

            const cell =
                worksheet.getCell(17, col);

            cell.font = {
                name: "Calibri",
                size: 11,
                bold: true,
                color: {
                    argb: WARNA.putih
                }
            };

            cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: {
                    argb: WARNA.headerTabel
                }
            };

            cell.alignment = {
                horizontal: "center",
                vertical: "middle"
            };

            cell.border = BORDER;
        }


        rekapCabang.forEach(
            (item, index) => {

                const rowNumber =
                    18 + index;

                worksheet.getCell(
                    `A${rowNumber}`
                ).value =
                    item.nama || "-";

                worksheet.getCell(
                    `B${rowNumber}`
                ).value =
                    item.jumlah || 0;

                for (let col = 1; col <= 2; col++) {

                    const cell =
                        worksheet.getCell(
                            rowNumber,
                            col
                        );

                    cell.font = FONT_NORMAL;

                    cell.border = BORDER;

                    cell.alignment = {
                        vertical: "middle",
                        horizontal:
                            col === 2
                                ? "center"
                                : "left"
                    };

                    if (index % 2 === 1) {

                        cell.fill = {
                            type: "pattern",
                            pattern: "solid",
                            fgColor: {
                                argb: WARNA.abuMuda
                            }
                        };
                    }
                }
            }
        );


        // =================================================
        // REKAP TEKNISI
        // =================================================

        const teknisiTitleRow =
            19 + rekapCabang.length;

        worksheet.mergeCells(
            `A${teknisiTitleRow}:G${teknisiTitleRow}`
        );

        const teknisiTitle =
            worksheet.getCell(
                `A${teknisiTitleRow}`
            );

        teknisiTitle.value =
            "REKAP BERDASARKAN TEKNISI / SOW";

        teknisiTitle.font = {
            name: "Calibri",
            size: 12,
            bold: true,
            color: {
                argb: WARNA.putih
            }
        };

        teknisiTitle.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: {
                argb: WARNA.header
            }
        };

        teknisiTitle.alignment = {
            horizontal: "center",
            vertical: "middle"
        };

        teknisiTitle.border = BORDER;


        const teknisiHeaderRow =
            teknisiTitleRow + 1;

        worksheet.getCell(
            `A${teknisiHeaderRow}`
        ).value =
            "Teknisi / SOW";

        worksheet.getCell(
            `B${teknisiHeaderRow}`
        ).value =
            "Jumlah";


        for (let col = 1; col <= 2; col++) {

            const cell =
                worksheet.getCell(
                    teknisiHeaderRow,
                    col
                );

            cell.font = {
                name: "Calibri",
                size: 11,
                bold: true,
                color: {
                    argb: WARNA.putih
                }
            };

            cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: {
                    argb: WARNA.headerTabel
                }
            };

            cell.alignment = {
                horizontal: "center",
                vertical: "middle"
            };

            cell.border = BORDER;
        }


        rekapTeknisi.forEach(
            (item, index) => {

                const rowNumber =
                    teknisiHeaderRow +
                    1 +
                    index;

                worksheet.getCell(
                    `A${rowNumber}`
                ).value =
                    item.nama || "-";

                worksheet.getCell(
                    `B${rowNumber}`
                ).value =
                    item.jumlah || 0;

                for (let col = 1; col <= 2; col++) {

                    const cell =
                        worksheet.getCell(
                            rowNumber,
                            col
                        );

                    cell.font = FONT_NORMAL;

                    cell.border = BORDER;

                    cell.alignment = {
                        vertical: "middle",
                        horizontal:
                            col === 2
                                ? "center"
                                : "left"
                    };

                    if (index % 2 === 1) {

                        cell.fill = {
                            type: "pattern",
                            pattern: "solid",
                            fgColor: {
                                argb: WARNA.abuMuda
                            }
                        };
                    }
                }
            }
        );


        // =================================================
        // DETAIL ORDER
        // =================================================

        const detailTitleRow =
            teknisiHeaderRow +
            1 +
            rekapTeknisi.length +
            1;

        worksheet.mergeCells(
            `A${detailTitleRow}:G${detailTitleRow}`
        );

        const detailTitle =
            worksheet.getCell(
                `A${detailTitleRow}`
            );

        detailTitle.value =
            "DETAIL ORDER";

        detailTitle.font = {
            name: "Calibri",
            size: 12,
            bold: true,
            color: {
                argb: WARNA.putih
            }
        };

        detailTitle.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: {
                argb: WARNA.header
            }
        };

        detailTitle.alignment = {
            horizontal: "center",
            vertical: "middle"
        };

        detailTitle.border = BORDER;


        // =================================================
        // HEADER DETAIL
        // =================================================

        const detailHeaderRow =
            detailTitleRow + 1;

        const headerDetail = [

            "Kode Order",

            "Nama",

            "Kode Cabang",

            "Jenis Kendala",

            "Tanggal",

            "Status",

            "Teknisi / SOW"

        ];


        headerDetail.forEach(
            (judul, index) => {

                const cell =
                    worksheet.getCell(
                        detailHeaderRow,
                        index + 1
                    );

                cell.value = judul;

                cell.font = {
                    name: "Calibri",
                    size: 11,
                    bold: true,
                    color: {
                        argb: WARNA.putih
                    }
                };

                cell.fill = {
                    type: "pattern",
                    pattern: "solid",
                    fgColor: {
                        argb: WARNA.headerTabel
                    }
                };

                cell.alignment = {
                    horizontal: "center",
                    vertical: "middle",
                    wrapText: true
                };

                cell.border = BORDER;
            }
        );


        // =================================================
        // DETAIL DATA
        // =================================================

        orders.forEach(
            (order, index) => {

                const rowNumber =
                    detailHeaderRow +
                    1 +
                    index;

                const dataDetail = [

                    order.kode || "",

                    order.nama || "",

                    order.kode_cabang || "",

                    order.jenis_kendala || "",

                    formatTanggalIndonesia(
                        order.tanggal
                    ),

                    order.status || "OPEN",

                    order.teknisi || "Belum Ditentukan"

                ];


                dataDetail.forEach(
                    (value, colIndex) => {

                        const cell =
                            worksheet.getCell(
                                rowNumber,
                                colIndex + 1
                            );

                        cell.value = value;

                        cell.font = FONT_NORMAL;

                        cell.border = BORDER;

                        cell.alignment = {
                            vertical: "middle",
                            horizontal:
                                colIndex === 4 ||
                                    colIndex === 5
                                    ? "center"
                                    : "left",
                            wrapText: true
                        };


                        // -----------------------------------------
                        // WARNA SELANG-SELING
                        // -----------------------------------------

                        if (index % 2 === 1) {

                            cell.fill = {
                                type: "pattern",
                                pattern: "solid",
                                fgColor: {
                                    argb: WARNA.abuMuda
                                }
                            };
                        }

                    }
                );


                // ---------------------------------------------
                // WARNA STATUS
                // ---------------------------------------------

                const status =
                    String(
                        order.status || "OPEN"
                    ).toUpperCase();

                let statusColor =
                    WARNA.open;

                if (status === "PROSES") {
                    statusColor =
                        WARNA.proses;
                }

                if (status === "SELESAI") {
                    statusColor =
                        WARNA.selesai;
                }

                if (status === "DITOLAK") {
                    statusColor =
                        WARNA.ditolak;
                }

                const statusCell =
                    worksheet.getCell(
                        rowNumber,
                        6
                    );

                statusCell.fill = {
                    type: "pattern",
                    pattern: "solid",
                    fgColor: {
                        argb: statusColor
                    }
                };

                statusCell.font = {
                    name: "Calibri",
                    size: 11,
                    bold: true,
                    color: {
                        argb: WARNA.hitam
                    }
                };

                statusCell.alignment = {
                    horizontal: "center",
                    vertical: "middle"
                };

            }
        );


        // =================================================
        // AUTO FILTER DETAIL
        // =================================================

        const detailLastRow =
            detailHeaderRow +
            Math.max(orders.length, 1);

        worksheet.autoFilter = {
            from: `A${detailHeaderRow}`,
            to: `G${detailLastRow}`
        };


        // =================================================
        // TINGGI BARIS
        // =================================================

        worksheet.getRow(3).height = 8;

        worksheet.getRow(7).height = 8;

        worksheet.getRow(15).height = 8;

        for (
            let row = detailHeaderRow;
            row <= detailLastRow;
            row++
        ) {

            worksheet.getRow(row).height = 22;
        }


        // =================================================
        // PAGE SETUP
        // =================================================

        worksheet.pageSetup = {

            orientation: "landscape",

            paperSize:
                worksheet.PAPERSIZE_A4,

            fitToPage: true,

            fitToWidth: 1,

            fitToHeight: 0,

            horizontalDpi: 300,

            verticalDpi: 300,

            margins: {
                left: 0.3,
                right: 0.3,
                top: 0.5,
                bottom: 0.5,
                header: 0.2,
                footer: 0.2
            }

        };


        // =================================================
        // PRINT AREA
        // =================================================

        worksheet.printArea =
            `A1:G${detailLastRow}`;


        // =================================================
        // ALIGNMENT UMUM
        // =================================================

        worksheet.eachRow(
            (row) => {

                row.eachCell(
                    (cell) => {

                        if (!cell.alignment) {

                            cell.alignment = {
                                vertical: "middle"
                            };

                        }

                    }
                );

            }
        );


        // =================================================
        // GENERATE FILE
        // =================================================

        const buffer =
            await workbook.xlsx.writeBuffer();


        const blob =
            new Blob(
                [buffer],
                {
                    type:
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                }
            );


        const url =
            URL.createObjectURL(blob);


        const link =
            document.createElement("a");

        link.href = url;

        link.download =
            namaFile;

        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);


        setTimeout(
            () => {
                URL.revokeObjectURL(url);
            },
            1000
        );


    } catch (error) {

        console.error(
            "DOWNLOAD EXCEL ERROR:",
            error
        );

        alert(
            "Gagal membuat file Excel.\n\n" +
            error.message
        );

    }

}
// =====================================================
// FUNGSI TAMPILKAN HASIL REKAP
// =====================================================

function tampilkanHasilRekap(
    result,
    periode
) {

    console.log(
        "Data hasil rekap:",
        result
    );


    // =====================================================
    // DATA STATISTIK
    // =====================================================

    const statistik =
        result.statistik || {};


    const total =
        Number(
            statistik.total || 0
        );


    const open =
        Number(
            statistik.open || 0
        );


    const proses =
        Number(
            statistik.proses || 0
        );


    const selesai =
        Number(
            statistik.selesai || 0
        );


    const ditolak =
        Number(
            statistik.ditolak || 0
        );


    // =====================================================
    // DATA REKAP
    // =====================================================

    const rekapCabang =
        result.rekapCabang || [];


    const rekapTeknisi =
        result.rekapTeknisi || [];


    const rekapBulanan =
        result.rekapBulanan || [];


    const orders =
        result.orders || [];


    // =====================================================
    // FORMAT TANGGAL
    // =====================================================

    function formatTanggalTampilan(
        tanggal
    ) {

        if (!tanggal) {
            return "-";
        }


        const text =
            String(
                tanggal
            ).trim();


        const match =
            text.match(
                /^(\d{4})-(\d{2})-(\d{2})$/
            );


        if (!match) {
            return text;
        }


        return (
            match[3] +
            "/" +
            match[2] +
            "/" +
            match[1]
        );

    }


    // =====================================================
    // NAMA PERIODE
    // =====================================================

    const namaPeriode =
        String(
            periode || ""
        ).toUpperCase();




    const tanggalSampai =
        result.periode?.sampai || "-";


    // =====================================================
    // HTML REKAP
    // =====================================================

    let html = `

        <!-- ========================================= -->
        <!-- STATISTIK -->
        <!-- ========================================= -->

        <div class="rekap-stat-container">

            <div class="rekap-stat-card">

                <span>Total Order</span>

                <strong>
                    ${total}
                </strong>

            </div>


            <div class="rekap-stat-card">

                <span>OPEN</span>

                <strong>
                    ${open}
                </strong>

            </div>


            <div class="rekap-stat-card">

                <span>PROSES</span>

                <strong>
                    ${proses}
                </strong>

            </div>


            <div class="rekap-stat-card">

                <span>SELESAI</span>

                <strong>
                    ${selesai}
                </strong>

            </div>


            <div class="rekap-stat-card">

                <span>DITOLAK</span>

                <strong>
                    ${ditolak}
                </strong>

            </div>

        </div>


        <!-- ========================================= -->
        <!-- PERIODE -->
        <!-- ========================================= -->

        <div class="rekap-table-container">

            <div class="rekap-table-title">

                📊 REKAP ${namaPeriode}

            </div>


            <table class="rekap-table">

                <thead>

                    <tr>

                        <th>Keterangan</th>

                        <th>Jumlah</th>

                    </tr>

                </thead>


                <tbody>

                    <tr>

                        <td>
                            Total Order
                        </td>

                        <td>
                            ${total}
                        </td>

                    </tr>


                    <tr>

                        <td>
                            OPEN
                        </td>

                        <td>
                            ${open}
                        </td>

                    </tr>


                    <tr>

                        <td>
                            PROSES
                        </td>

                        <td>
                            ${proses}
                        </td>

                    </tr>


                    <tr>

                        <td>
                            SELESAI
                        </td>

                        <td>
                            ${selesai}
                        </td>

                    </tr>


                    <tr>

                        <td>
                            DITOLAK
                        </td>

                        <td>
                            ${ditolak}
                        </td>

                    </tr>

                </tbody>

            </table>

        </div>


        <!-- ========================================= -->
        <!-- REKAP CABANG -->
        <!-- ========================================= -->

        <div class="rekap-table-container">

            <div class="rekap-table-title">

                🏢 REKAP BERDASARKAN CABANG

            </div>


            <table class="rekap-table">

                <thead>

                    <tr>

                        <th>Cabang</th>

                        <th>Jumlah</th>

                    </tr>

                </thead>


                <tbody>
    `;


    if (
        rekapCabang.length === 0
    ) {

        html += `

            <tr>

                <td colspan="2">
                    Tidak ada data cabang.
                </td>

            </tr>

        `;

    }

    else {

        rekapCabang.forEach(
            function (item) {

                html += `

                    <tr>

                        <td>
                            ${item.nama || "-"}
                        </td>

                        <td>
                            ${item.jumlah || 0}
                        </td>

                    </tr>

                `;

            }
        );

    }


    html += `

                </tbody>

            </table>

        </div>


        <!-- ========================================= -->
        <!-- REKAP TEKNISI -->
        <!-- ========================================= -->

        <div class="rekap-table-container">

            <div class="rekap-table-title">

                👨‍🔧 REKAP BERDASARKAN TEKNISI / SOW

            </div>


            <table class="rekap-table">

                <thead>

                    <tr>

                        <th>Teknisi / SOW</th>

                        <th>Jumlah</th>

                    </tr>

                </thead>


                <tbody>
    `;


    if (
        rekapTeknisi.length === 0
    ) {

        html += `

            <tr>

                <td colspan="2">
                    Tidak ada data teknisi.
                </td>

            </tr>

        `;

    }

    else {

        rekapTeknisi.forEach(
            function (item) {

                html += `

                    <tr>

                        <td>
                            ${item.nama || "-"}
                        </td>

                        <td>
                            ${item.jumlah || 0}
                        </td>

                    </tr>

                `;

            }
        );

    }


    html += `

                </tbody>

            </table>

        </div>


        <!-- ========================================= -->
        <!-- REKAP BULANAN -->
        <!-- KHUSUS TAHUNAN -->
        <!-- ========================================= -->
    `;


    if (
        periode === "tahunan" &&
        rekapBulanan.length > 0
    ) {

        html += `

            <div class="rekap-table-container">

                <div class="rekap-table-title">

                    📅 REKAP PER BULAN

                </div>


                <table class="rekap-table">

                    <thead>

                        <tr>

                            <th>Bulan</th>

                            <th>Total</th>

                            <th>OPEN</th>

                            <th>PROSES</th>

                            <th>SELESAI</th>

                            <th>DITOLAK</th>

                        </tr>

                    </thead>


                    <tbody>

        `;


        rekapBulanan.forEach(
            function (item) {

                html += `

                    <tr>

                        <td>
                            ${item.bulan || "-"}
                        </td>

                        <td>
                            ${item.total || 0}
                        </td>

                        <td>
                            ${item.open || 0}
                        </td>

                        <td>
                            ${item.proses || 0}
                        </td>

                        <td>
                            ${item.selesai || 0}
                        </td>

                        <td>
                            ${item.ditolak || 0}
                        </td>

                    </tr>

                `;

            }
        );


        html += `

                    </tbody>

                </table>

            </div>

        `;

    }


    // =====================================================
    // DETAIL ORDER
    // =====================================================

    html += `

        <div class="rekap-table-container">

            <div class="rekap-table-title">

                📋 DETAIL ORDER

            </div>


            <div class="rekap-detail-wrapper">

                <table class="rekap-table">

                    <thead>

                        <tr>

                            <th>No</th>

                            <th>Kode Order</th>

                            <th>Nama</th>

                            <th>NIP</th>

                            <th>Kode Cabang</th>

                            <th>Jenis Kendala</th>

                            <th>Deskripsi</th>

                            <th>WhatsApp</th>

                            <th>Tanggal</th>

                            <th>Jam</th>

                            <th>Status</th>

                            <th>Teknisi / SOW</th>

                            <th>Catatan Progres</th>

                        </tr>

                    </thead>


                    <tbody>
    `;


    if (
        orders.length === 0
    ) {

        html += `

            <tr>

                <td colspan="13">

                    Tidak ada order pada periode
                    yang dipilih.

                </td>

            </tr>

        `;

    }

    else {

        orders.forEach(
            function (
                order,
                index
            ) {

                html += `

                    <tr>

                        <td>
                            ${index + 1}
                        </td>

                        <td>
                            ${order.kode || "-"}
                        </td>

                        <td>
                            ${order.nama || "-"}
                        </td>

                        <td>
                            ${order.nip || "-"}
                        </td>

                        <td>
                            ${order.kode_cabang || "-"}
                        </td>

                        <td>
                            ${order.jenis_kendala || "-"}
                        </td>

                        <td>
                            ${order.deskripsi || "-"}
                        </td>

                        <td>
                            ${order.whatsapp || "-"}
                        </td>

                        <td>
                            ${formatTanggalTampilan(
                    order.tanggal
                )}
                        </td>

                        <td>
                            ${order.jam || "-"}
                        </td>

                        <td>
                            ${order.status || "-"}
                        </td>

                        <td>
                            ${order.teknisi || "-"}
                        </td>

                        <td>
                            ${order.catatan_progres || "-"}
                        </td>

                    </tr>

                `;

            }
        );

    }


    html += `

                    </tbody>

                </table>

            </div>

        </div>

    `;


    // =====================================================
    // MASUKKAN KE HALAMAN
    // =====================================================

    rekapResult.innerHTML =
        html;


    console.log(
        "Rekap berhasil ditampilkan."
    );

}

// =====================================================
// TAHAP 13
// MANAJEMEN TEKNISI / SOW
// =====================================================

let daftarTeknisiAdmin = [];


// =====================================================
// LOAD TEKNISI
// =====================================================

async function loadTeknisiAdmin() {

    const tbody =
        document.getElementById(
            "teknisiTableBody"
        );

    if (!tbody) {
        return;
    }

    try {

        const params =
            new URLSearchParams();

        params.append(
            "token",
            ADMIN_TOKEN
        );

        params.append(
            "teknisi",
            "true"
        );


        const response =
            await fetch(
                API_URL +
                "?" +
                params.toString()
            );


        const result =
            await response.json();


        if (
            result.unauthorized
        ) {

            localStorage.removeItem(
                "adminToken"
            );

            window.location.href =
                "login.html";

            return;

        }


        if (
            !result.success
        ) {

            throw new Error(
                result.message ||
                "Gagal mengambil Teknisi."
            );

        }


        daftarTeknisiAdmin =
            Array.isArray(
                result.teknisi
            )
                ? result.teknisi
                : [];


        renderTeknisiAdmin();

        updateSelectTeknisi();


    }
    catch (error) {

        console.error(
            "LOAD TEKNISI ERROR:",
            error
        );

        tbody.innerHTML = `
            <tr>
                <td colspan="5"
                    class="teknisi-loading">

                    ❌ Gagal memuat daftar Teknisi.

                </td>
            </tr>
        `;

    }

}


// =====================================================
// TAMPILKAN TABEL TEKNISI
// =====================================================

function renderTeknisiAdmin() {

    const tbody =
        document.getElementById(
            "teknisiTableBody"
        );

    if (!tbody) {
        return;
    }


    if (
        daftarTeknisiAdmin.length === 0
    ) {

        tbody.innerHTML = `
            <tr>
                <td colspan="5"
                    class="teknisi-loading">

                    Belum ada Teknisi / SOW.

                </td>
            </tr>
        `;

        return;

    }


    tbody.innerHTML =
        daftarTeknisiAdmin
            .map(
                function (item, index) {

                    const aktif =
                        item.status === "AKTIF";

                    return `
                        <tr>

                            <td>
                                ${index + 1}
                            </td>

                            <td>
                                <strong>
                                    ${escapeHtmlTeknisi(item.nama)}
                                </strong>
                            </td>

                            <td>

                                <span
                                    class="status-teknisi
                                    ${aktif ? "aktif" : "nonaktif"}">

                                    ${aktif ? "AKTIF" : "NONAKTIF"}

                                </span>

                            </td>

                            <td>
                                ${item.tanggal_update || "-"}
                            </td>

                            <td>

                                <div
                                    class="aksi-teknisi">

                                    <button
                                        type="button"
                                        class="btn-edit-teknisi"
                                        onclick="editTeknisiAdmin(${item.id})">

                                        ✏️ Edit

                                    </button>

                                    <button
                                        type="button"
                                        class="btn-status-teknisi"
                                        onclick="ubahStatusTeknisiAdmin(${item.id})">

                                        ${aktif
                            ? "⛔ Nonaktifkan"
                            : "✅ Aktifkan"}

                                    </button>

                                </div>

                            </td>

                        </tr>
                    `;

                }
            )
            .join("");

}


// =====================================================
// UPDATE SELECT TEKNISI PADA UPDATE ORDER
// =====================================================

function updateSelectTeknisi() {

    const select =
        document.getElementById(
            "updateTeknisi"
        );

    if (!select) {
        return;
    }


    const nilaiLama =
        select.value;


    select.innerHTML = `
        <option value="">
            -- Pilih Teknisi / SOW --
        </option>
    `;


    daftarTeknisiAdmin
        .filter(function (item) {

            return item.status === "AKTIF";

        })
        .forEach(function (item) {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                item.nama;

            option.textContent =
                item.nama;

            select.appendChild(
                option
            );

        });


    // Pertahankan pilihan lama
    if (nilaiLama) {

        select.value =
            nilaiLama;

    }

}


// =====================================================
// MODAL TAMBAH
// =====================================================

function bukaTambahTeknisi() {

    const modal =
        document.getElementById(
            "teknisiModal"
        );

    const title =
        document.getElementById(
            "teknisiModalTitle"
        );

    const nama =
        document.getElementById(
            "teknisiNamaInput"
        );

    const id =
        document.getElementById(
            "teknisiIdInput"
        );


    title.textContent =
        "Tambah Teknisi / SOW";

    nama.value = "";

    id.value = "";


    modal.classList.add(
        "show"
    );


    setTimeout(
        function () {
            nama.focus();
        },
        100
    );

}


// =====================================================
// MODAL EDIT
// =====================================================

function editTeknisiAdmin(id) {

    const item =
        daftarTeknisiAdmin.find(
            function (teknisi) {

                return Number(
                    teknisi.id
                ) === Number(id);

            }
        );


    if (!item) {

        alert(
            "Data Teknisi tidak ditemukan."
        );

        return;

    }


    document.getElementById(
        "teknisiModalTitle"
    ).textContent =
        "Edit Teknisi / SOW";


    document.getElementById(
        "teknisiNamaInput"
    ).value =
        item.nama;


    document.getElementById(
        "teknisiIdInput"
    ).value =
        item.id;


    document.getElementById(
        "teknisiModal"
    ).classList.add(
        "show"
    );


    document.getElementById(
        "teknisiNamaInput"
    ).focus();

}


// =====================================================
// TUTUP MODAL
// =====================================================

function tutupTeknisiModal() {

    const modal =
        document.getElementById(
            "teknisiModal"
        );

    if (modal) {

        modal.classList.remove(
            "show"
        );

    }

}


// =====================================================
// SIMPAN TAMBAH / EDIT
// =====================================================

async function simpanTeknisiAdmin() {

    const nama =
        document.getElementById(
            "teknisiNamaInput"
        ).value.trim();


    const id =
        document.getElementById(
            "teknisiIdInput"
        ).value;


    if (!nama) {

        alert(
            "Nama Teknisi / SOW wajib diisi."
        );

        return;

    }


    const action =
        id
            ? "editTeknisi"
            : "tambahTeknisi";


    const button =
        document.getElementById(
            "simpanTeknisiButton"
        );


    button.disabled = true;

    button.textContent =
        "Menyimpan...";


    try {

        const response =
            await fetch(
                API_URL,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "text/plain;charset=utf-8"
                    },

                    body:
                        JSON.stringify({

                            action:
                                action,

                            token:
                                ADMIN_TOKEN,

                            id:
                                id
                                    ? Number(id)
                                    : undefined,

                            nama:
                                nama

                        })
                }
            );


        const result =
            await response.json();


        if (
            result.unauthorized
        ) {

            localStorage.removeItem(
                "adminToken"
            );

            window.location.href =
                "login.html";

            return;

        }


        if (
            !result.success
        ) {

            throw new Error(
                result.message ||
                "Gagal menyimpan Teknisi."
            );

        }


        alert(
            result.message ||
            "Berhasil."
        );


        tutupTeknisiModal();

        await loadTeknisiAdmin();


    }
    catch (error) {

        console.error(
            "SIMPAN TEKNISI ERROR:",
            error
        );

        alert(
            "❌ " +
            error.message
        );

    }
    finally {

        button.disabled = false;

        button.textContent =
            "💾 Simpan";

    }

}


// =====================================================
// AKTIF / NONAKTIF
// =====================================================

async function ubahStatusTeknisiAdmin(id) {

    const item =
        daftarTeknisiAdmin.find(
            function (teknisi) {

                return Number(
                    teknisi.id
                ) === Number(id);

            }
        );


    if (!item) {
        return;
    }


    const statusBaru =
        item.status === "AKTIF"
            ? "NONAKTIF"
            : "AKTIF";


    const konfirmasi =
        confirm(
            "Ubah status \"" +
            item.nama +
            "\" menjadi " +
            statusBaru +
            "?"
        );


    if (!konfirmasi) {
        return;
    }


    try {

        const response =
            await fetch(
                API_URL,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "text/plain;charset=utf-8"
                    },

                    body:
                        JSON.stringify({

                            action:
                                "ubahStatusTeknisi",

                            token:
                                ADMIN_TOKEN,

                            id:
                                Number(id)

                        })
                }
            );


        const result =
            await response.json();


        if (
            result.unauthorized
        ) {

            localStorage.removeItem(
                "adminToken"
            );

            window.location.href =
                "login.html";

            return;

        }


        if (
            !result.success
        ) {

            throw new Error(
                result.message ||
                "Gagal mengubah status."
            );

        }


        alert(
            result.message
        );


        await loadTeknisiAdmin();


    }
    catch (error) {

        console.error(
            "STATUS TEKNISI ERROR:",
            error
        );

        alert(
            "❌ " +
            error.message
        );

    }

}


// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHtmlTeknisi(text) {

    return String(
        text || ""
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


// =====================================================
// EVENT LISTENER
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const tambah =
            document.getElementById(
                "tambahTeknisiButton"
            );

        const simpan =
            document.getElementById(
                "simpanTeknisiButton"
            );

        const batal =
            document.getElementById(
                "batalTeknisiButton"
            );

        const close =
            document.getElementById(
                "closeTeknisiModal"
            );


        if (tambah) {

            tambah.addEventListener(
                "click",
                bukaTambahTeknisi
            );

        }


        if (simpan) {

            simpan.addEventListener(
                "click",
                simpanTeknisiAdmin
            );

        }


        if (batal) {

            batal.addEventListener(
                "click",
                tutupTeknisiModal
            );

        }


        if (close) {

            close.addEventListener(
                "click",
                tutupTeknisiModal
            );

        }


        const modal =
            document.getElementById(
                "teknisiModal"
            );


        if (modal) {

            modal.addEventListener(
                "click",
                function (event) {

                    if (
                        event.target === modal
                    ) {

                        tutupTeknisiModal();

                    }

                }
            );

        }


        // ---------------------------------------------
        // LOAD OTOMATIS
        // ---------------------------------------------

        loadTeknisiAdmin();

    }
);
// =====================================================
// TAHAP 13
// SIDEBAR MENU ADMIN
// MODE HALAMAN
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const sidebar =
            document.getElementById(
                "adminSidebar"
            );

        const menuButton =
            document.getElementById(
                "sidebarMenuButton"
            );

        const closeButton =
            document.getElementById(
                "sidebarCloseButton"
            );

        const overlay =
            document.getElementById(
                "sidebarOverlay"
            );

        const menuItems =
            document.querySelectorAll(
                ".sidebar-menu-item"
            );


        // =================================================
        // DEFAULT = DASHBOARD
        // =================================================

        document.body.classList.add(
            "mode-dashboard"
        );


        // =================================================
        // BUKA SIDEBAR
        // =================================================

        function bukaSidebar() {

            if (sidebar) {

                sidebar.classList.add(
                    "open"
                );

            }

            if (overlay) {

                overlay.classList.add(
                    "show"
                );

            }

        }


        // =================================================
        // TUTUP SIDEBAR
        // =================================================

        function tutupSidebar() {

            if (sidebar) {

                sidebar.classList.remove(
                    "open"
                );

            }

            if (overlay) {

                overlay.classList.remove(
                    "show"
                );

            }

        }


        // =================================================
        // RESET MODE
        // =================================================

        function resetMode() {

            document.body.classList.remove(
                "mode-dashboard",
                "mode-rekap",
                "mode-teknisi"
            );


            menuItems.forEach(
                function (menu) {

                    menu.classList.remove(
                        "active"
                    );

                }
            );

        }


        // =================================================
        // BUKA DASHBOARD
        // =================================================

        function bukaDashboard() {

            resetMode();

            document.body.classList.add(
                "mode-dashboard"
            );


            const menuDashboard =
                document.querySelector(
                    '[data-menu-target="dashboard"]'
                );


            if (menuDashboard) {

                menuDashboard.classList.add(
                    "active"
                );

            }


            window.scrollTo({

                top: 0,

                behavior: "smooth"

            });


            tutupSidebar();

        }


        // =================================================
        // BUKA REKAP
        // =================================================

        function bukaRekap() {

            resetMode();

            document.body.classList.add(
                "mode-rekap"
            );


            const menuRekap =
                document.querySelector(
                    '[data-menu-target="rekap"]'
                );


            if (menuRekap) {

                menuRekap.classList.add(
                    "active"
                );

            }


            const rekap =
                document.querySelector(
                    ".rekap-container"
                );


            if (rekap) {

                setTimeout(
                    function () {

                        rekap.scrollIntoView({

                            behavior: "smooth",

                            block: "start"

                        });

                    },
                    50
                );

            }


            tutupSidebar();

        }


        // =================================================
        // BUKA TEKNISI
        // =================================================

        function bukaTeknisi() {

            resetMode();

            document.body.classList.add(
                "mode-teknisi"
            );


            const menuTeknisi =
                document.querySelector(
                    '[data-menu-target="teknisi"]'
                );


            if (menuTeknisi) {

                menuTeknisi.classList.add(
                    "active"
                );

            }


            const teknisi =
                document.querySelector(
                    ".teknisi-container"
                );


            if (teknisi) {

                setTimeout(
                    function () {

                        teknisi.scrollIntoView({

                            behavior: "smooth",

                            block: "start"

                        });

                    },
                    50
                );

            }


            tutupSidebar();

        }


        // =================================================
        // TOMBOL ☰
        // =================================================

        if (menuButton) {

            menuButton.addEventListener(
                "click",
                bukaSidebar
            );

        }


        // =================================================
        // TOMBOL ✕
        // =================================================

        if (closeButton) {

            closeButton.addEventListener(
                "click",
                tutupSidebar
            );

        }


        // =================================================
        // OVERLAY
        // =================================================

        if (overlay) {

            overlay.addEventListener(
                "click",
                tutupSidebar
            );

        }


        // =================================================
        // MENU SIDEBAR
        // =================================================

        menuItems.forEach(
            function (item) {

                item.addEventListener(
                    "click",
                    function () {

                        const target =
                            item.dataset.menuTarget;


                        if (
                            target ===
                            "dashboard"
                        ) {

                            bukaDashboard();

                        }


                        else if (
                            target ===
                            "rekap"
                        ) {

                            bukaRekap();

                        }


                        else if (
                            target ===
                            "teknisi"
                        ) {

                            bukaTeknisi();

                        }

                    }
                );

            }
        );


        // =================================================
        // ESCAPE
        // =================================================

        document.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key ===
                    "Escape"
                ) {

                    tutupSidebar();

                }

            }
        );


        // =================================================
        // DASHBOARD AKTIF SAAT AWAL
        // =================================================

        const menuDashboard =
            document.querySelector(
                '[data-menu-target="dashboard"]'
            );


        if (menuDashboard) {

            menuDashboard.classList.add(
                "active"
            );

        }

    }
);