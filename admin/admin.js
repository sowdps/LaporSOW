/**
 * ============================================================
 * MY SOW BALI
 * ADMIN DASHBOARD
 * FILE : admin/admin.js
 * VERSION : FINAL FIX CABANG
 * ============================================================
 *
 * FUNGSI:
 * - Dashboard order
 * - Kode + nama cabang
 * - Filter order
 * - Detail order
 * - Update status
 * - Penugasan SOW
 * - Manajemen SOW
 * - Rekap
 * - Download Excel
 * - Sidebar
 * - Logout
 *
 * FORMAT CABANG:
 * 0040-KCU DENPASAR
 * 6113-NAMA CABANG
 * 7065-NAMA CABANG
 * ============================================================
 */


/* ============================================================
   01. API & SESSION
   ============================================================ */

const API_URL =
    "https://script.google.com/macros/s/AKfycbwMyIJyYAX2Ioik1Bv_TM5lx-XgLdmhay0vwbl3jNc_rQ7fN_ShL3rPbEAefk381_o/exec";

const ADMIN_TOKEN =
    localStorage.getItem("MY_SOW_ADMIN_TOKEN") || "";

if (!ADMIN_TOKEN) {
    window.location.replace("login.html");
}


/* ============================================================
   02. DATA GLOBAL
   ============================================================ */

let semuaOrders = [];
let orderAktif = null;
let daftarSow = [];
let hasilRekapTerakhir = null;
let periodeRekapAktif = "harian";

let sessionCheckTimer = null;
let sessionExpired = false;


/*
 * MASTER CABANG
 *
 * Contoh:
 *
 * masterCabangMap["7065"] = "NAMA CABANG";
 * masterCabangMap["0040"] = "KCU DENPASAR";
 */
let masterCabangMap = {};


/* ============================================================
   03. ELEMENT DOM
   ============================================================ */

let orderTableBody;
let totalOrder;
let totalOpen;
let totalProses;
let totalSelesai;

let searchOrder;
let filterCabang;
let filterTanggalMulai;
let filterTanggalSampai;
let searchButton;
let resetFilter;

let detailModal;
let detailKode;
let detailNama;
let detailUnitKerja;
let detailCabang;
let detailJenisKendala;
let detailDeskripsi;
let detailWhatsapp;
let detailTanggal;
let detailJam;
let detailStatus;
let detailTeknisi;
let detailCatatan;
let detailTanggalUpdate;
let detailRiwayat;

let updateStatus;
let updateTeknisi;
let updateCatatan;
let saveUpdateButton;

let rekapPeriodForm;
let tampilkanRekapButton;
let downloadRekapExcelButton;
let rekapResult;

let teknisiTableBody;
let tambahTeknisiButton;
let teknisiModal;
let teknisiModalTitle;
let closeTeknisiModal;
let teknisiNamaInput;
let teknisiIdInput;
let batalTeknisiButton;
let simpanTeknisiButton;

let sidebarMenuButton;
let sidebarOverlay;
let adminSidebar;
let sidebarCloseButton;
let logoutButton;


/* ============================================================
   04. AMBIL ELEMENT DOM
   ============================================================ */

function ambilElementDOM() {

    orderTableBody =
        document.getElementById("orderTableBody");

    totalOrder =
        document.getElementById("totalOrder");

    totalOpen =
        document.getElementById("totalOpen");

    totalProses =
        document.getElementById("totalProses");

    totalSelesai =
        document.getElementById("totalSelesai");

    searchOrder =
        document.getElementById("searchOrder");

    filterCabang =
        document.getElementById("filterCabang");

    filterTanggalMulai =
        document.getElementById("filterTanggalMulai");

    filterTanggalSampai =
        document.getElementById("filterTanggalSampai");

    searchButton =
        document.getElementById("searchButton");

    resetFilter =
        document.getElementById("resetFilter");


    detailModal =
        document.getElementById("detailModal");

    detailKode =
        document.getElementById("detailKode");

    detailNama =
        document.getElementById("detailNama");

    detailUnitKerja =
        document.getElementById("detailUnitKerja");

    detailCabang =
        document.getElementById("detailCabang");

    detailJenisKendala =
        document.getElementById("detailJenisKendala");

    detailDeskripsi =
        document.getElementById("detailDeskripsi");

    detailWhatsapp =
        document.getElementById("detailWhatsapp");

    detailTanggal =
        document.getElementById("detailTanggal");

    detailJam =
        document.getElementById("detailJam");

    detailStatus =
        document.getElementById("detailStatus");

    detailTeknisi =
        document.getElementById("detailTeknisi");

    detailCatatan =
        document.getElementById("detailCatatan");

    detailTanggalUpdate =
        document.getElementById("detailTanggalUpdate");

    detailRiwayat =
        document.getElementById("detailRiwayat");


    updateStatus =
        document.getElementById("updateStatus");

    updateTeknisi =
        document.getElementById("updateTeknisi");

    updateCatatan =
        document.getElementById("updateCatatan");

    saveUpdateButton =
        document.getElementById("saveUpdateButton");


    rekapPeriodForm =
        document.getElementById("rekapPeriodForm");

    tampilkanRekapButton =
        document.getElementById("tampilkanRekapButton");

    downloadRekapExcelButton =
        document.getElementById("downloadRekapExcelButton");

    rekapResult =
        document.getElementById("rekapResult");


    teknisiTableBody =
        document.getElementById("teknisiTableBody");

    tambahTeknisiButton =
        document.getElementById("tambahTeknisiButton");

    teknisiModal =
        document.getElementById("teknisiModal");

    teknisiModalTitle =
        document.getElementById("teknisiModalTitle");

    closeTeknisiModal =
        document.getElementById("closeTeknisiModal");

    teknisiNamaInput =
        document.getElementById("teknisiNamaInput");

    teknisiIdInput =
        document.getElementById("teknisiIdInput");

    batalTeknisiButton =
        document.getElementById("batalTeknisiButton");

    simpanTeknisiButton =
        document.getElementById("simpanTeknisiButton");


    sidebarMenuButton =
        document.getElementById("sidebarMenuButton");

    sidebarOverlay =
        document.getElementById("sidebarOverlay");

    adminSidebar =
        document.getElementById("adminSidebar");

    sidebarCloseButton =
        document.getElementById("sidebarCloseButton");

    logoutButton =
        document.getElementById("logoutButton");
}


/* ============================================================
   05. UTILITAS
   ============================================================ */

function escapeHtml(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function escapeAttribute(value) {
    return escapeHtml(value);
}


function formatTanggal(value) {

    if (!value) {
        return "-";
    }

    const text = String(value).trim();

    if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {

        const p = text.split("-");

        return `${p[2]}/${p[1]}/${p[0]}`;
    }

    return text;
}


/* ============================================================
   06. NORMALISASI KODE CABANG
   ============================================================ */

function normalisasiKodeCabang(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    let kode =
        String(value).trim();

    /*
     * Kalau data berbentuk:
     *
     * 7065-NAMA CABANG
     *
     * ambil hanya 7065.
     */
    if (kode.includes("-")) {

        kode =
            kode
                .split("-")[0]
                .trim();
    }

    return kode;
}


/* ============================================================
   07. FORMAT CABANG FINAL
   ============================================================
 *
 * INI BAGIAN UTAMA PERBAIKAN.
 *
 * Contoh:
 *
 * order.kode_cabang = 7065
 *
 * MASTER_DATA:
 * 7065 = NAMA CABANG
 *
 * HASIL:
 * 7065-NAMA CABANG
 *
 * ============================================================ */

function formatCabang(order) {

    let kode =
        normalisasiKodeCabang(
            order?.kode_cabang ||
            order?.kodeCabang ||
            ""
        );


    /*
     * Kalau kode kosong tetapi backend
     * sudah mengirim cabang lengkap.
     */
    if (!kode) {

        const cabang =
            String(
                order?.cabang ||
                ""
            ).trim();

        if (cabang) {

            return cabang.replace(
                /\s*-\s*/,
                "-"
            );
        }

        const nama =
            String(
                order?.nama_cabang ||
                order?.namaCabang ||
                ""
            ).trim();

        return nama || "-";
    }


    /*
     * ========================================================
     * CARI NAMA CABANG DARI MASTER_DATA
     * ========================================================
     */

    const namaMaster =
        masterCabangMap[
        kode.toUpperCase()
        ] || "";


    if (namaMaster) {

        return (
            kode +
            "-" +
            namaMaster
        );
    }


    /*
     * Fallback jika backend sudah
     * mengirim nama cabang.
     */

    const namaBackend =
        String(
            order?.nama_cabang ||
            order?.namaCabang ||
            ""
        ).trim();


    if (namaBackend) {

        return (
            kode +
            "-" +
            namaBackend
        );
    }


    /*
     * Fallback terakhir.
     */

    if (order?.cabang) {

        return String(
            order.cabang
        )
            .trim()
            .replace(
                /\s*-\s*/,
                "-"
            );
    }


    return kode;
}


/* ============================================================
   08. API GET
   ============================================================ */

async function apiGet(params = {}) {

    const query =
        new URLSearchParams(params);

    const response =
        await fetch(
            API_URL +
            "?" +
            query.toString(),
            {
                method: "GET",
                cache: "no-store"
            }
        );

    const text =
        await response.text();

    try {

        return JSON.parse(text);

    } catch (error) {

        console.error(
            "RESPON GET:",
            text
        );

        throw new Error(
            "Respon server tidak valid."
        );
    }
}


/* ============================================================
   09. API POST
   ============================================================ */

async function apiPost(data = {}) {

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
                    JSON.stringify(data)
            }
        );

    const text =
        await response.text();

    try {

        return JSON.parse(text);

    } catch (error) {

        console.error(
            "RESPON POST:",
            text
        );

        throw new Error(
            "Respon server tidak valid."
        );
    }
}


/* ============================================================
   10. SESSION
   ============================================================ */

function logoutLocal(reason = "") {

    if (sessionExpired) {
        return;
    }

    sessionExpired = true;

    if (sessionCheckTimer) {

        clearInterval(
            sessionCheckTimer
        );

        sessionCheckTimer = null;
    }

    if (reason) {

        console.warn(reason);
    }

    localStorage.removeItem(
        "MY_SOW_ADMIN_TOKEN"
    );

    window.location.replace(
        "login.html"
    );
}


async function logoutAdmin() {

    try {

        await apiPost({

            action:
                "logoutAdmin",

            token:
                ADMIN_TOKEN

        });

    } catch (error) {

        console.warn(
            "Logout server:",
            error
        );

    } finally {

        logoutLocal(
            "Admin logout."
        );
    }
}


async function cekSessionAdmin() {

    if (
        !ADMIN_TOKEN ||
        sessionExpired
    ) {
        return;
    }

    try {

        const result =
            await apiPost({

                action:
                    "touchAdminSession",

                token:
                    ADMIN_TOKEN

            });

        if (
            result &&
            result.success === false &&
            result.unauthorized
        ) {

            logoutLocal(
                "Session admin sudah berakhir."
            );
        }

    } catch (error) {

        console.warn(
            "Pemeriksaan session gagal:",
            error
        );
    }
}


function setupAdminSession() {

    cekSessionAdmin();

    sessionCheckTimer =
        setInterval(
            cekSessionAdmin,
            5 * 60 * 1000
        );
}


/* ============================================================
   11. LOAD MASTER CABANG
   ============================================================
 *
 * MASTER_DATA:
 *
 * KODE -> NAMA
 *
 * Kemudian disimpan ke:
 *
 * masterCabangMap
 *
 * ============================================================ */

async function loadCabangMasterData() {

    /*
     * RESET MAPPING
     */
    masterCabangMap = {};


    try {

        const result =
            await apiGet({
                master: "true"
            });


        if (
            !result ||
            result.success !== true
        ) {

            throw new Error(
                result?.message ||
                "Master cabang gagal dimuat."
            );
        }


        const cabang =
            Array.isArray(
                result.cabang
            )
                ? result.cabang
                : [];


        /*
         * SIMPAN KODE -> NAMA
         */
        cabang.forEach(
            function (item) {

                const kode =
                    normalisasiKodeCabang(
                        item?.kode
                    );

                const nama =
                    String(
                        item?.nama ||
                        ""
                    ).trim();


                if (!kode) {
                    return;
                }


                masterCabangMap[
                    kode.toUpperCase()
                ] =
                    nama;
            }
        );


        /*
         * Isi dropdown filter.
         */
        if (filterCabang) {

            filterCabang.innerHTML =
                '<option value="">Semua Cabang</option>';


            cabang.forEach(
                function (item) {

                    const kode =
                        normalisasiKodeCabang(
                            item?.kode
                        );

                    const nama =
                        String(
                            item?.nama ||
                            ""
                        ).trim();


                    if (!kode) {
                        return;
                    }


                    const option =
                        document.createElement(
                            "option"
                        );


                    option.value =
                        kode;


                    option.textContent =
                        nama
                            ? `${kode}-${nama}`
                            : kode;


                    filterCabang.appendChild(
                        option
                    );
                }
            );
        }


        console.log(
            "MASTER CABANG BERHASIL DIMUAT:",
            masterCabangMap
        );


    } catch (error) {

        console.error(
            "MASTER CABANG:",
            error
        );
    }
}


/* ============================================================
   12. LOAD ORDER
   ============================================================ */

async function loadOrders() {

    if (!orderTableBody) {
        return;
    }


    orderTableBody.innerHTML = `
        <tr>
            <td colspan="9">
                Memuat data order...
            </td>
        </tr>
    `;


    const params = {

        token:
            ADMIN_TOKEN

    };


    const kode =
        searchOrder
            ? searchOrder.value.trim()
            : "";


    const cabang =
        filterCabang
            ? filterCabang.value.trim()
            : "";


    const tanggalMulai =
        filterTanggalMulai
            ? filterTanggalMulai.value
            : "";


    const tanggalSampai =
        filterTanggalSampai
            ? filterTanggalSampai.value
            : "";


    if (kode) {

        params.kode =
            kode;
    }


    if (cabang) {

        params.cabang =
            cabang;
    }


    if (tanggalMulai) {

        params.tanggalMulai =
            tanggalMulai;
    }


    if (tanggalSampai) {

        params.tanggalSampai =
            tanggalSampai;
    }


    try {

        const result =
            await apiGet(params);


        if (
            !result ||
            result.success !== true
        ) {

            if (
                result?.unauthorized
            ) {

                logoutLocal(
                    "Session admin tidak valid."
                );

                return;
            }


            throw new Error(
                result?.message ||
                "Gagal mengambil data order."
            );
        }


        semuaOrders =
            Array.isArray(
                result.orders
            )
                ? result.orders
                : [];


        updateStatistics(
            result.statistik || {}
        );


        renderOrders();


    } catch (error) {

        console.error(
            "LOAD ORDER:",
            error
        );


        orderTableBody.innerHTML = `
            <tr>
                <td colspan="9">
                    Gagal memuat data order.<br>
                    ${escapeHtml(
            error.message
        )}
                </td>
            </tr>
        `;
    }
}


/* ============================================================
   13. RENDER DASHBOARD
   ============================================================ */

function renderOrders() {

    if (!orderTableBody) {
        return;
    }


    if (!semuaOrders.length) {

        orderTableBody.innerHTML = `
            <tr>
                <td colspan="9">
                    Belum ada data order.
                </td>
            </tr>
        `;

        return;
    }


    orderTableBody.innerHTML =
        semuaOrders.map(
            function (order, index) {

                const status =
                    String(
                        order?.status ||
                        "OPEN"
                    ).toUpperCase();


                const sow =
                    order?.sow ||
                    order?.teknisi ||
                    "-";


                /*
                 * HASIL FINAL CABANG:
                 *
                 * 7065-NAMA CABANG
                 */
                const cabang =
                    formatCabang(
                        order
                    );


                return `
                    <tr>

                        <td>
                            ${index + 1}
                        </td>

                        <td>
                            ${escapeHtml(
                    order?.kode ||
                    "-"
                )}
                        </td>

                        <td>
                            ${escapeHtml(
                    order?.nama ||
                    "-"
                )}
                        </td>

                        <td>
                            ${escapeHtml(
                    cabang
                )}
                        </td>

                        <td>
                            ${escapeHtml(
                    order?.jenis_kendala ||
                    "-"
                )}
                        </td>

                        <td>
                            ${escapeHtml(
                    formatTanggal(
                        order?.tanggal
                    )
                )}
                        </td>

                        <td>
                            ${escapeHtml(
                    status
                )}
                        </td>

                        <td>
                            ${escapeHtml(
                    sow
                )}
                        </td>

                        <td>

                            <button
                                type="button"
                                class="btn-detail"
                                onclick="lihatDetail('${escapeAttribute(
                    order?.kode || ""
                )}')"
                            >
                                Detail
                            </button>

                        </td>

                    </tr>
                `;
            }
        ).join("");
}


/* ============================================================
   14. STATISTIK
   ============================================================ */

function updateStatistics(statistik) {

    if (totalOrder) {

        totalOrder.textContent =
            statistik.total ?? 0;
    }


    if (totalOpen) {

        totalOpen.textContent =
            statistik.open ?? 0;
    }


    if (totalProses) {

        totalProses.textContent =
            statistik.proses ?? 0;
    }


    if (totalSelesai) {

        totalSelesai.textContent =
            statistik.selesai ?? 0;
    }
}


/* ============================================================
   15. DETAIL ORDER
   ============================================================ */

function cariOrderLokal(kode) {

    return (
        semuaOrders.find(
            function (order) {

                return (
                    String(
                        order?.kode ||
                        ""
                    ) ===
                    String(
                        kode ||
                        ""
                    )
                );
            }
        ) || null
    );
}


function lihatDetail(kode) {

    const order =
        cariOrderLokal(kode);


    if (!order) {

        alert(
            "Data order tidak ditemukan."
        );

        return;
    }


    orderAktif =
        order;


    detailKode.textContent =
        order.kode ||
        "-";


    detailNama.textContent =
        order.nama ||
        "-";


    detailUnitKerja.textContent =
        order.unit_kerja ||
        order.unitKerja ||
        "-";


    detailCabang.textContent =
        formatCabang(
            order
        );


    detailJenisKendala.textContent =
        order.jenis_kendala ||
        "-";


    detailDeskripsi.textContent =
        order.deskripsi ||
        "-";


    detailWhatsapp.textContent =
        order.whatsapp ||
        "-";


    detailTanggal.textContent =
        formatTanggal(
            order.tanggal
        );


    detailJam.textContent =
        order.jam ||
        "-";


    detailStatus.textContent =
        order.status ||
        "OPEN";


    detailTeknisi.textContent =
        order.sow ||
        order.teknisi ||
        "-";


    detailCatatan.textContent =
        order.catatan_progres ||
        order.catatan ||
        "-";


    detailTanggalUpdate.textContent =
        order.tanggal_update ||
        "-";


    detailRiwayat.textContent =
        order.riwayat_status ||
        "Belum ada riwayat.";


    updateStatus.value =
        order.status ||
        "OPEN";


    updateSelectTeknisi();


    updateTeknisi.value =
        order.sow ||
        order.teknisi ||
        "";


    updateCatatan.value =
        order.catatan_progres ||
        order.catatan ||
        "";


    detailModal.style.display =
        "flex";


    detailModal.setAttribute(
        "aria-hidden",
        "false"
    );
}


function tutupDetailModal() {

    if (detailModal) {

        detailModal.style.display =
            "none";

        detailModal.setAttribute(
            "aria-hidden",
            "true"
        );
    }


    orderAktif =
        null;
}


/* ============================================================
   16. UPDATE ORDER
   ============================================================ */

async function simpanUpdateOrder() {

    if (!orderAktif) {

        alert(
            "Order belum dipilih."
        );

        return;
    }


    const statusBaru =
        updateStatus.value.trim();


    const sowBaru =
        updateTeknisi.value.trim();


    const catatanBaru =
        updateCatatan.value.trim();


    if (!statusBaru) {

        alert(
            "Status wajib dipilih."
        );

        return;
    }


    if (
        !confirm(
            "Simpan perubahan order " +
            orderAktif.kode +
            "?"
        )
    ) {
        return;
    }


    saveUpdateButton.disabled =
        true;


    try {

        const result =
            await apiPost({

                action:
                    "updateOrder",

                token:
                    ADMIN_TOKEN,

                kode:
                    orderAktif.kode,

                status:
                    statusBaru,

                teknisi:
                    sowBaru,

                catatan_progres:
                    catatanBaru

            });


        if (
            !result ||
            result.success !== true
        ) {

            if (
                result?.unauthorized
            ) {

                logoutLocal(
                    "Session admin berakhir."
                );

                return;
            }


            throw new Error(
                result?.message ||
                "Update order gagal."
            );
        }


        alert(
            result.message ||
            "Order berhasil diperbarui."
        );


        tutupDetailModal();


        await loadOrders();


    } catch (error) {

        console.error(
            "UPDATE ORDER:",
            error
        );


        alert(
            "Gagal memperbarui order.\n\n" +
            error.message
        );


    } finally {

        saveUpdateButton.disabled =
            false;
    }
}


/* ============================================================
   17. FILTER
   ============================================================ */

function resetSemuaFilter() {

    if (searchOrder) {
        searchOrder.value = "";
    }


    if (filterCabang) {
        filterCabang.value = "";
    }


    if (filterTanggalMulai) {
        filterTanggalMulai.value = "";
    }


    if (filterTanggalSampai) {
        filterTanggalSampai.value = "";
    }


    loadOrders();
}


/* ============================================================
   18. SIDEBAR
   ============================================================ */

function bukaSidebar() {

    if (adminSidebar) {

        adminSidebar.classList.add(
            "open"
        );
    }


    if (sidebarOverlay) {

        sidebarOverlay.classList.add(
            "show"
        );
    }
}


function tutupSidebar() {

    if (adminSidebar) {

        adminSidebar.classList.remove(
            "open"
        );
    }


    if (sidebarOverlay) {

        sidebarOverlay.classList.remove(
            "show"
        );
    }
}


function setModeHalaman(mode) {

    document.body.classList.remove(
        "mode-dashboard",
        "mode-rekap",
        "mode-teknisi"
    );


    if (
        mode === "rekap"
    ) {

        document.body.classList.add(
            "mode-rekap"
        );

    } else if (
        mode === "teknisi"
    ) {

        document.body.classList.add(
            "mode-teknisi"
        );

    } else {

        document.body.classList.add(
            "mode-dashboard"
        );
    }
}


function setMenuAktif(target) {

    document
        .querySelectorAll(
            "[data-menu-target]"
        )
        .forEach(
            function (menu) {

                menu.classList.toggle(
                    "active",
                    menu.dataset.menuTarget ===
                    target
                );
            }
        );
}


function bukaMenu(target) {

    setMenuAktif(target);

    setModeHalaman(target);

    tutupSidebar();


    if (
        target === "dashboard"
    ) {

        loadOrders();

        return;
    }


    if (
        target === "rekap"
    ) {

        tampilkanFormPeriode(
            periodeRekapAktif
        );

        return;
    }


    if (
        target === "teknisi"
    ) {

        loadTeknisiAdmin();
    }
}


/* ============================================================
   19. SOW
   ============================================================ */

async function loadTeknisiAdmin() {

    if (!teknisiTableBody) {
        return;
    }


    teknisiTableBody.innerHTML = `
        <tr>
            <td colspan="5">
                Memuat daftar SOW...
            </td>
        </tr>
    `;


    try {

        const result =
            await apiGet({

                token:
                    ADMIN_TOKEN,

                teknisi:
                    "true"

            });


        if (
            !result ||
            result.success !== true
        ) {

            throw new Error(
                result?.message ||
                "Data SOW gagal dimuat."
            );
        }


        daftarSow =
            Array.isArray(
                result.teknisi
            )
                ? result.teknisi
                : [];


        renderTeknisiAdmin();

        updateSelectTeknisi();


    } catch (error) {

        console.error(
            "LOAD SOW:",
            error
        );


        daftarSow =
            [];


        updateSelectTeknisi();


        teknisiTableBody.innerHTML = `
            <tr>
                <td colspan="5">
                    Gagal memuat SOW.<br>
                    ${escapeHtml(
            error.message
        )}
                </td>
            </tr>
        `;
    }
}


function renderTeknisiAdmin() {

    if (!teknisiTableBody) {
        return;
    }


    if (!daftarSow.length) {

        teknisiTableBody.innerHTML = `
            <tr>
                <td colspan="5">
                    Belum ada data SOW.
                </td>
            </tr>
        `;

        return;
    }


    teknisiTableBody.innerHTML =
        daftarSow.map(
            function (item, index) {

                const id =
                    item?.id ||
                    item?.kode ||
                    "";


                const nama =
                    item?.nama ||
                    "";


                const status =
                    String(
                        item?.status ||
                        "AKTIF"
                    ).toUpperCase();


                const tanggal =
                    item?.tanggal_update ||
                    "-";


                const statusBaru =
                    status === "AKTIF"
                        ? "NONAKTIF"
                        : "AKTIF";


                return `
                    <tr>

                        <td>
                            ${index + 1}
                        </td>

                        <td>
                            ${escapeHtml(nama)}
                        </td>

                        <td>
                            ${escapeHtml(status)}
                        </td>

                        <td>
                            ${escapeHtml(tanggal)}
                        </td>

                        <td>

                            <button
                                type="button"
                                class="btn-detail"
                                onclick="editTeknisiAdmin('${escapeAttribute(id)}')"
                            >
                                Edit
                            </button>

                            <button
                                type="button"
                                class="btn-detail"
                                onclick="ubahStatusTeknisiAdmin('${escapeAttribute(id)}','${statusBaru}')"
                            >
                                ${status === "AKTIF"
                        ? "Nonaktifkan"
                        : "Aktifkan"
                    }
                            </button>

                        </td>

                    </tr>
                `;
            }
        ).join("");
}


function updateSelectTeknisi() {

    if (!updateTeknisi) {
        return;
    }


    const nilaiLama =
        updateTeknisi.value;


    updateTeknisi.innerHTML = `
        <option value="">
            -- Pilih SOW --
        </option>
    `;


    daftarSow.forEach(
        function (item) {

            const status =
                String(
                    item?.status ||
                    "AKTIF"
                ).toUpperCase();


            const nama =
                String(
                    item?.nama ||
                    ""
                ).trim();


            if (
                status !== "AKTIF" ||
                !nama
            ) {
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


            updateTeknisi.appendChild(
                option
            );
        }
    );


    if (nilaiLama) {

        updateTeknisi.value =
            nilaiLama;
    }
}


function bukaTambahTeknisi() {

    teknisiModalTitle.textContent =
        "Tambah SOW";


    teknisiIdInput.value =
        "";


    teknisiNamaInput.value =
        "";


    teknisiModal.style.display =
        "flex";
}


function editTeknisiAdmin(id) {

    const item =
        daftarSow.find(
            function (row) {

                return (
                    String(
                        row?.id ||
                        row?.kode ||
                        ""
                    ) ===
                    String(id)
                );
            }
        );


    if (!item) {

        alert(
            "Data SOW tidak ditemukan."
        );

        return;
    }


    teknisiModalTitle.textContent =
        "Edit SOW";


    teknisiIdInput.value =
        item.id ||
        item.kode ||
        "";


    teknisiNamaInput.value =
        item.nama ||
        "";


    teknisiModal.style.display =
        "flex";
}


function tutupTeknisiModal() {

    if (!teknisiModal) {
        return;
    }


    teknisiModal.style.display =
        "none";
}


async function simpanTeknisiAdmin() {

    const id =
        teknisiIdInput.value.trim();


    const nama =
        teknisiNamaInput.value.trim();


    if (!nama) {

        alert(
            "Nama SOW wajib diisi."
        );

        return;
    }


    simpanTeknisiButton.disabled =
        true;


    try {

        const result =
            await apiPost({

                action:
                    id
                        ? "editTeknisi"
                        : "tambahTeknisi",

                token:
                    ADMIN_TOKEN,

                id:
                    id,

                nama:
                    nama

            });


        if (
            !result ||
            result.success !== true
        ) {

            throw new Error(
                result?.message ||
                "SOW gagal disimpan."
            );
        }


        alert(
            result.message ||
            "SOW berhasil disimpan."
        );


        tutupTeknisiModal();


        await loadTeknisiAdmin();


    } catch (error) {

        alert(
            "Gagal menyimpan SOW.\n\n" +
            error.message
        );


    } finally {

        simpanTeknisiButton.disabled =
            false;
    }
}


async function ubahStatusTeknisiAdmin(
    id,
    status
) {

    if (
        !confirm(
            "Ubah status SOW menjadi " +
            status +
            "?"
        )
    ) {
        return;
    }


    try {

        const result =
            await apiPost({

                action:
                    "ubahStatusTeknisi",

                token:
                    ADMIN_TOKEN,

                id:
                    id,

                status:
                    status

            });


        if (
            !result ||
            result.success !== true
        ) {

            throw new Error(
                result?.message ||
                "Status SOW gagal diubah."
            );
        }


        await loadTeknisiAdmin();


    } catch (error) {

        alert(
            "Gagal mengubah status SOW.\n\n" +
            error.message
        );
    }
}


/* ============================================================
   20. REKAP
   ============================================================ */

function tampilkanFormPeriode(periode) {

    periodeRekapAktif =
        periode || "harian";


    if (!rekapPeriodForm) {
        return;
    }


    if (
        periodeRekapAktif ===
        "harian"
    ) {

        rekapPeriodForm.innerHTML = `
            <div class="rekap-input-group">

                <div class="rekap-input-item">

                    <label>
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


    if (
        periodeRekapAktif ===
        "mingguan"
    ) {

        rekapPeriodForm.innerHTML = `
            <div class="rekap-input-group">

                <div class="rekap-input-item">

                    <label>
                        Tanggal Mulai
                    </label>

                    <input
                        type="date"
                        id="rekapTanggalMulai"
                    >

                </div>

                <div class="rekap-input-item">

                    <label>
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


    if (
        periodeRekapAktif ===
        "bulanan"
    ) {

        rekapPeriodForm.innerHTML = `
            <div class="rekap-input-group">

                <div class="rekap-input-item">

                    <label>
                        Bulan
                    </label>

                    <select id="rekapBulan">

                        <option value="">
                            -- Pilih Bulan --
                        </option>

                        <option value="1">Januari</option>
                        <option value="2">Februari</option>
                        <option value="3">Maret</option>
                        <option value="4">April</option>
                        <option value="5">Mei</option>
                        <option value="6">Juni</option>
                        <option value="7">Juli</option>
                        <option value="8">Agustus</option>
                        <option value="9">September</option>
                        <option value="10">Oktober</option>
                        <option value="11">November</option>
                        <option value="12">Desember</option>

                    </select>

                </div>

                <div class="rekap-input-item">

                    <label>
                        Tahun
                    </label>

                    <input
                        type="number"
                        id="rekapTahun"
                        placeholder="2026"
                    >

                </div>

            </div>
        `;

        return;
    }


    if (
        periodeRekapAktif ===
        "tahunan"
    ) {

        rekapPeriodForm.innerHTML = `
            <div class="rekap-input-group">

                <div class="rekap-input-item">

                    <label>
                        Tahun
                    </label>

                    <input
                        type="number"
                        id="rekapTahun"
                        placeholder="2026"
                    >

                </div>

            </div>
        `;
    }
}


function ambilParameterRekap() {

    if (
        periodeRekapAktif ===
        "harian"
    ) {

        const tanggal =
            document.getElementById(
                "rekapTanggal"
            )?.value || "";


        if (!tanggal) {

            alert(
                "Silakan pilih tanggal."
            );

            return null;
        }


        return {
            tipe: "harian",
            tanggal: tanggal
        };
    }


    if (
        periodeRekapAktif ===
        "mingguan"
    ) {

        const tanggalMulai =
            document.getElementById(
                "rekapTanggalMulai"
            )?.value || "";


        const tanggalSampai =
            document.getElementById(
                "rekapTanggalSampai"
            )?.value || "";


        if (
            !tanggalMulai ||
            !tanggalSampai
        ) {

            alert(
                "Silakan pilih tanggal mulai dan tanggal sampai."
            );

            return null;
        }


        return {

            tipe:
                "mingguan",

            tanggalMulai:
                tanggalMulai,

            tanggalSampai:
                tanggalSampai
        };
    }


    if (
        periodeRekapAktif ===
        "bulanan"
    ) {

        const bulan =
            document.getElementById(
                "rekapBulan"
            )?.value || "";


        const tahun =
            document.getElementById(
                "rekapTahun"
            )?.value || "";


        if (
            !bulan ||
            !tahun
        ) {

            alert(
                "Silakan pilih bulan dan tahun."
            );

            return null;
        }


        return {

            tipe:
                "bulanan",

            bulan:
                bulan,

            tahun:
                tahun
        };
    }


    if (
        periodeRekapAktif ===
        "tahunan"
    ) {

        const tahun =
            document.getElementById(
                "rekapTahun"
            )?.value || "";


        if (!tahun) {

            alert(
                "Silakan pilih tahun."
            );

            return null;
        }


        return {

            tipe:
                "tahunan",

            tahun:
                tahun
        };
    }


    return null;
}


async function tampilkanRekap() {

    const parameter =
        ambilParameterRekap();


    if (!parameter) {
        return;
    }


    if (rekapResult) {

        rekapResult.innerHTML =
            "Memuat rekap...";
    }


    try {

        const params = {

            token:
                ADMIN_TOKEN,

            rekap:
                "true",

            tipe:
                parameter.tipe
        };


        if (parameter.tanggal) {
            params.tanggal =
                parameter.tanggal;
        }


        if (parameter.tanggalMulai) {
            params.tanggalMulai =
                parameter.tanggalMulai;
        }


        if (parameter.tanggalSampai) {
            params.tanggalSampai =
                parameter.tanggalSampai;
        }


        if (parameter.bulan) {
            params.bulan =
                parameter.bulan;
        }


        if (parameter.tahun) {
            params.tahun =
                parameter.tahun;
        }


        const result =
            await apiGet(params);


        if (
            !result ||
            result.success !== true
        ) {

            throw new Error(
                result?.message ||
                "Gagal mengambil rekap."
            );
        }


        hasilRekapTerakhir =
            result;


        renderRekap(result);


    } catch (error) {

        console.error(
            "REKAP:",
            error
        );


        if (rekapResult) {

            rekapResult.innerHTML = `
                <div>
                    Gagal memuat rekap.<br>
                    ${escapeHtml(
                error.message
            )}
                </div>
            `;
        }
    }
}


/* ============================================================
   21. RENDER REKAP
   ============================================================ */

function renderRekap(result) {

    if (!rekapResult) {
        return;
    }


    const statistik =
        result?.statistik || {};


    const rekapCabang =
        Array.isArray(
            result?.rekapCabang
        )
            ? result.rekapCabang
            : [];


    const rekapTeknisi =
        Array.isArray(
            result?.rekapTeknisi
        )
            ? result.rekapTeknisi
            : [];


    let html = `

        <div class="rekap-summary">

            <div>
                Total:
                <strong>
                    ${statistik.total ?? 0}
                </strong>
            </div>

            <div>
                OPEN:
                <strong>
                    ${statistik.open ?? 0}
                </strong>
            </div>

            <div>
                PROSES:
                <strong>
                    ${statistik.proses ?? 0}
                </strong>
            </div>

            <div>
                SELESAI:
                <strong>
                    ${statistik.selesai ?? 0}
                </strong>
            </div>

        </div>


        <div class="rekap-table-container">

            <h3>
                Rekap Berdasarkan Cabang
            </h3>

            <div class="table-wrapper">

                <table>

                    <thead>

                        <tr>

                            <th>No</th>

                            <th>
                                Kode Cabang
                            </th>

                            <th>
                                Nama Cabang
                            </th>

                            <th>
                                Jumlah
                            </th>

                        </tr>

                    </thead>

                    <tbody>
    `;


    if (!rekapCabang.length) {

        html += `
            <tr>
                <td colspan="4">
                    Tidak ada data cabang.
                </td>
            </tr>
        `;

    } else {

        rekapCabang.forEach(
            function (item, index) {

                const kode =
                    String(
                        item?.kode ||
                        item?.kode_cabang ||
                        ""
                    ).trim();


                /*
                 * Nama dari backend.
                 *
                 * Code.gs:
                 * kode = kode cabang
                 * nama = nama cabang
                 */
                const nama =
                    String(
                        item?.nama ||
                        item?.nama_cabang ||
                        ""
                    ).trim();


                const jumlah =
                    Number(
                        item?.jumlah ??
                        item?.total ??
                        item?.count ??
                        0
                    );


                html += `

                    <tr>

                        <td>
                            ${index + 1}
                        </td>

                        <td>
                            ${escapeHtml(
                    kode || "-"
                )}
                        </td>

                        <td>
                            ${escapeHtml(
                    nama || "-"
                )}
                        </td>

                        <td>
                            ${jumlah}
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


        <div class="rekap-table-container">

            <h3>
                Rekap Berdasarkan SOW
            </h3>

            <div class="table-wrapper">

                <table>

                    <thead>

                        <tr>

                            <th>No</th>

                            <th>SOW</th>

                            <th>Jumlah</th>

                        </tr>

                    </thead>

                    <tbody>
    `;


    if (!rekapTeknisi.length) {

        html += `
            <tr>
                <td colspan="3">
                    Tidak ada data SOW.
                </td>
            </tr>
        `;

    } else {

        rekapTeknisi.forEach(
            function (item, index) {

                const nama =
                    item?.nama ||
                    item?.teknisi ||
                    item?.sow ||
                    "-";


                const jumlah =
                    Number(
                        item?.jumlah ??
                        item?.total ??
                        item?.count ??
                        0
                    );


                html += `

                    <tr>

                        <td>
                            ${index + 1}
                        </td>

                        <td>
                            ${escapeHtml(nama)}
                        </td>

                        <td>
                            ${jumlah}
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


    rekapResult.innerHTML =
        html;
}


/* ============================================================
   22. DOWNLOAD EXCEL
   ============================================================ */

async function downloadRekapExcel() {

    if (!hasilRekapTerakhir) {

        alert(
            "Tampilkan Rekap terlebih dahulu."
        );

        return;
    }


    if (
        typeof XLSX ===
        "undefined"
    ) {

        alert(
            "Library Excel belum tersedia."
        );

        return;
    }


    const orders =
        Array.isArray(
            hasilRekapTerakhir.orders
        )
            ? hasilRekapTerakhir.orders
            : [];


    const data =
        orders.map(
            function (order, index) {

                return {

                    No:
                        index + 1,

                    "Kode Order":
                        order.kode || "",

                    Nama:
                        order.nama || "",

                    "Unit Kerja":
                        order.unit_kerja || "",

                    Cabang:
                        formatCabang(order),

                    "Jenis Kendala":
                        order.jenis_kendala || "",

                    Deskripsi:
                        order.deskripsi || "",

                    WhatsApp:
                        order.whatsapp || "",

                    Tanggal:
                        order.tanggal || "",

                    Jam:
                        order.jam || "",

                    Status:
                        order.status || "",

                    SOW:
                        order.sow ||
                        order.teknisi ||
                        "",

                    "Catatan Progres":
                        order.catatan_progres ||
                        ""
                };
            }
        );


    const worksheet =
        XLSX.utils.json_to_sheet(
            data
        );


    const workbook =
        XLSX.utils.book_new();


    XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        "Rekap SOW"
    );


    XLSX.writeFile(
        workbook,
        "REKAP_SOW_" +
        periodeRekapAktif +
        ".xlsx"
    );
}


/* ============================================================
   23. EVENT SIDEBAR
   ============================================================ */

function pasangEventSidebar() {

    document
        .querySelectorAll(
            "[data-menu-target]"
        )
        .forEach(
            function (menu) {

                menu.addEventListener(
                    "click",
                    function () {

                        bukaMenu(
                            menu.dataset.menuTarget
                        );
                    }
                );
            }
        );


    if (sidebarMenuButton) {

        sidebarMenuButton.addEventListener(
            "click",
            bukaSidebar
        );
    }


    if (sidebarCloseButton) {

        sidebarCloseButton.addEventListener(
            "click",
            tutupSidebar
        );
    }


    if (sidebarOverlay) {

        sidebarOverlay.addEventListener(
            "click",
            tutupSidebar
        );
    }
}


/* ============================================================
   24. EVENT FILTER
   ============================================================ */

function pasangEventFilter() {

    if (searchButton) {

        searchButton.addEventListener(
            "click",
            loadOrders
        );
    }


    if (resetFilter) {

        resetFilter.addEventListener(
            "click",
            resetSemuaFilter
        );
    }


    if (searchOrder) {

        searchOrder.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key ===
                    "Enter"
                ) {

                    loadOrders();
                }
            }
        );
    }
}


/* ============================================================
   25. EVENT DETAIL
   ============================================================ */

function pasangEventDetail() {

    const closeModal =
        document.getElementById(
            "closeModal"
        );


    const closeModalButton =
        document.getElementById(
            "closeModalButton"
        );


    if (closeModal) {

        closeModal.addEventListener(
            "click",
            tutupDetailModal
        );
    }


    if (closeModalButton) {

        closeModalButton.addEventListener(
            "click",
            tutupDetailModal
        );
    }


    if (saveUpdateButton) {

        saveUpdateButton.addEventListener(
            "click",
            simpanUpdateOrder
        );
    }


    if (detailModal) {

        detailModal.addEventListener(
            "click",
            function (event) {

                if (
                    event.target ===
                    detailModal
                ) {

                    tutupDetailModal();
                }
            }
        );
    }
}


/* ============================================================
   26. EVENT REKAP
   ============================================================ */

function pasangEventRekap() {

    document
        .querySelectorAll(
            ".rekap-period-button"
        )
        .forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        document
                            .querySelectorAll(
                                ".rekap-period-button"
                            )
                            .forEach(
                                function (item) {

                                    item.classList.remove(
                                        "active"
                                    );
                                }
                            );


                        button.classList.add(
                            "active"
                        );


                        tampilkanFormPeriode(
                            button.dataset.period ||
                            "harian"
                        );
                    }
                );
            }
        );


    if (
        tampilkanRekapButton
    ) {

        tampilkanRekapButton.addEventListener(
            "click",
            tampilkanRekap
        );
    }


    if (
        downloadRekapExcelButton
    ) {

        downloadRekapExcelButton.addEventListener(
            "click",
            downloadRekapExcel
        );
    }
}


/* ============================================================
   27. EVENT SOW
   ============================================================ */

function pasangEventSow() {

    if (
        tambahTeknisiButton
    ) {

        tambahTeknisiButton.addEventListener(
            "click",
            bukaTambahTeknisi
        );
    }


    if (
        closeTeknisiModal
    ) {

        closeTeknisiModal.addEventListener(
            "click",
            tutupTeknisiModal
        );
    }


    if (
        batalTeknisiButton
    ) {

        batalTeknisiButton.addEventListener(
            "click",
            tutupTeknisiModal
        );
    }


    if (
        simpanTeknisiButton
    ) {

        simpanTeknisiButton.addEventListener(
            "click",
            simpanTeknisiAdmin
        );
    }


    if (teknisiModal) {

        teknisiModal.addEventListener(
            "click",
            function (event) {

                if (
                    event.target ===
                    teknisiModal
                ) {

                    tutupTeknisiModal();
                }
            }
        );
    }
}


/* ============================================================
   28. EVENT LOGOUT
   ============================================================ */

function pasangEventLogout() {

    if (!logoutButton) {
        return;
    }


    logoutButton.addEventListener(
        "click",
        function () {

            if (
                confirm(
                    "Logout dari Admin SOW?"
                )
            ) {

                logoutAdmin();
            }
        }
    );
}


/* ============================================================
   29. EVENT ESC
   ============================================================ */

function pasangEventEscape() {

    document.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key !==
                "Escape"
            ) {
                return;
            }


            tutupSidebar();

            tutupDetailModal();

            tutupTeknisiModal();
        }
    );
}


/* ============================================================
   30. INIT ADMIN
   ============================================================ */

async function initAdminDashboard() {

    ambilElementDOM();


    /*
     * Dashboard adalah halaman pertama.
     */
    setModeHalaman(
        "dashboard"
    );


    setMenuAktif(
        "dashboard"
    );


    periodeRekapAktif =
        "harian";


    tampilkanFormPeriode(
        "harian"
    );


    /*
     * Pasang event.
     */
    pasangEventSidebar();

    pasangEventFilter();

    pasangEventDetail();

    pasangEventRekap();

    pasangEventSow();

    pasangEventLogout();

    pasangEventEscape();


    /*
     * Session.
     */
    setupAdminSession();


    /*
     * ========================================================
     * URUTAN PENTING
     * ========================================================
     *
     * 1. MASTER CABANG
     * 2. SOW
     * 3. ORDER
     *
     * Jangan load order sebelum master selesai.
     */
    await loadCabangMasterData();


    await loadTeknisiAdmin();


    await loadOrders();
}


/* ============================================================
   31. DOM READY
   ============================================================ */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        initAdminDashboard()
            .catch(
                function (error) {

                    console.error(
                        "INIT ADMIN ERROR:",
                        error
                    );
                }
            );
    }
);


/* ============================================================
   32. GLOBAL FUNCTION
   ============================================================ */

window.lihatDetail =
    lihatDetail;

window.bukaTambahTeknisi =
    bukaTambahTeknisi;

window.editTeknisiAdmin =
    editTeknisiAdmin;

window.ubahStatusTeknisiAdmin =
    ubahStatusTeknisiAdmin;

window.tutupTeknisiModal =
    tutupTeknisiModal;

window.simpanTeknisiAdmin =
    simpanTeknisiAdmin;

window.tutupDetailModal =
    tutupDetailModal;


/* ============================================================
   SELESAI
   ============================================================ */
