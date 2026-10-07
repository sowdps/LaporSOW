/**
 * ============================================================
 * MY SOW BALI
 * ADMIN DASHBOARD
 * FILE : admin.js
 * VERSION : FINAL CLEAN
 * ============================================================
 *
 * FUNGSI:
 * 1. Validasi session admin
 * 2. Auto logout 10 menit
 * 3. Dashboard order
 * 4. Filter order
 * 5. Kode order
 * 6. Kode cabang + nama cabang
 * 7. Detail order
 * 8. Update status
 * 9. Penugasan SOW
 * 10. Riwayat status
 * 11. Manajemen SOW
 * 12. Rekap laporan
 * 13. Download Excel
 * 14. Logout admin
 *
 * CATATAN PENTING:
 * - Tidak ada nomor WhatsApp admin di frontend.
 * - Tidak ada Fonnte token di frontend.
 * - WhatsApp sepenuhnya ditangani Code.gs.
 * - Nama cabang diambil dari MASTER_DATA.
 * - Backend menjadi sumber utama data order.
 * ============================================================
 */


/* ============================================================
   1. KONFIGURASI API
   ============================================================ */

const API_URL =
    "https://script.google.com/macros/s/AKfycbyOcM6jK4OHqHwd7203Do9Za0W23ZpA4wfmvBd2UsqQT_7v359DkjKTxdeaEqjQlqhV/exec";


/* ============================================================
   2. SESSION ADMIN
   ============================================================ */

const ADMIN_TOKEN =
    localStorage.getItem("MY_SOW_ADMIN_TOKEN");

if (!ADMIN_TOKEN) {

    window.location.replace("login.html");

}


/* ============================================================
   3. VARIABEL GLOBAL
   ============================================================ */

let semuaOrders = [];

let orderAktif = null;

let daftarSow = [];

let hasilRekapTerakhir = null;

let periodeRekapTerakhir = "";


/* ============================================================
   4. AUTO LOGOUT
   ============================================================ */

const ADMIN_IDLE_MINUTES = 10;

const ADMIN_IDLE_MS =
    ADMIN_IDLE_MINUTES *
    60 *
    1000;

let adminIdleTimer = null;

let adminLogoutInProgress = false;

let adminLastServerTouch = 0;


/* ============================================================
   5. REFERENSI ELEMENT HTML
   ============================================================ */

function getElement(id) {

    return document.getElementById(id);

}


/* ============================================================
   6. ELEMENT DASHBOARD
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


/* ============================================================
   7. ELEMENT DETAIL ORDER
   ============================================================ */

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


/* ============================================================
   8. ELEMENT UPDATE ORDER
   ============================================================ */

let updateStatus;

let updateTeknisi;

let updateCatatan;

let saveUpdateButton;

let closeModalButton;

let closeModal;


/* ============================================================
   9. ELEMENT REKAP
   ============================================================ */

let rekapPeriodForm;

let tampilkanRekapButton;

let downloadRekapExcelButton;

let rekapResult;


/* ============================================================
   10. ELEMENT SOW
   ============================================================ */

let teknisiTableBody;

let tambahTeknisiButton;

let teknisiModal;

let teknisiModalTitle;

let closeTeknisiModal;

let teknisiNamaInput;

let teknisiIdInput;

let batalTeknisiButton;

let simpanTeknisiButton;


/* ============================================================
   11. ELEMENT SIDEBAR
   ============================================================ */

let sidebarMenuButton;

let sidebarOverlay;

let adminSidebar;

let sidebarCloseButton;

let logoutButton;


/* ============================================================
   12. ESCAPE HTML
   Mencegah HTML injection pada data spreadsheet
   ============================================================ */

function escapeHtml(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* ============================================================
   13. ESCAPE ATTRIBUTE
   ============================================================ */

function escapeAttribute(value) {

    return escapeHtml(value)
        .replace(/`/g, "&#096;");

}


/* ============================================================
   14. FORMAT TANGGAL
   ============================================================ */

function formatTanggalTampilan(value) {

    if (!value) {

        return "-";

    }

    const text =
        String(value).trim();

    if (
        /^\d{4}-\d{2}-\d{2}$/.test(text)
    ) {

        const parts =
            text.split("-");

        return (
            parts[2] +
            "/" +
            parts[1] +
            "/" +
            parts[0]
        );

    }

    return text;

}


/* ============================================================
   15. FORMAT WAKTU
   ============================================================ */

function formatTanggalJam(value) {

    if (!value) {

        return "-";

    }

    return String(value);

}


/* ============================================================
   16. REQUEST GET KE API
   ============================================================ */

async function apiGet(params = {}) {

    const query =
        new URLSearchParams(params);

    const url =
        API_URL +
        "?" +
        query.toString();

    const response =
        await fetch(url, {
            method: "GET",
            cache: "no-store"
        });

    if (!response.ok) {

        throw new Error(
            "HTTP Error " +
            response.status
        );

    }

    const text =
        await response.text();

    let result;

    try {

        result =
            JSON.parse(text);

    } catch (error) {

        console.error(
            "RESPON API BUKAN JSON:",
            text
        );

        throw new Error(
            "Server mengembalikan respon yang tidak valid."
        );

    }

    return result;

}


/* ============================================================
   17. REQUEST POST KE API
   ============================================================ */

async function apiPost(data = {}) {

    const response =
        await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type":
                    "text/plain;charset=utf-8"
            },
            body: JSON.stringify(data)
        });

    if (!response.ok) {

        throw new Error(
            "HTTP Error " +
            response.status
        );

    }

    const text =
        await response.text();

    let result;

    try {

        result =
            JSON.parse(text);

    } catch (error) {

        console.error(
            "RESPON POST BUKAN JSON:",
            text
        );

        throw new Error(
            "Server mengembalikan respon tidak valid."
        );

    }

    return result;

}


/* ============================================================
   18. LOGOUT ADMIN LOCAL
   ============================================================ */

function logoutAdminLocal() {

    if (adminLogoutInProgress) {

        return;

    }

    adminLogoutInProgress = true;

    localStorage.removeItem(
        "MY_SOW_ADMIN_TOKEN"
    );

    window.location.replace(
        "login.html"
    );

}


/* ============================================================
   19. LOGOUT PAKSA
   ============================================================ */

function forceLogoutAdmin(reason) {

    console.warn(
        "ADMIN LOGOUT:",
        reason
    );

    logoutAdminLocal();

}


/* ============================================================
   20. RESET TIMER IDLE
   ============================================================ */

function resetAdminIdleTimer() {

    if (adminIdleTimer) {

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


/* ============================================================
   21. TOUCH SESSION SERVER
   ============================================================ */

async function touchAdminSessionServer() {

    const now =
        Date.now();

    if (
        now -
        adminLastServerTouch <
        60 * 1000
    ) {

        return;

    }

    adminLastServerTouch =
        now;

    try {

        const result =
            await apiPost({

                action:
                    "touchAdminSession",

                token:
                    ADMIN_TOKEN

            });

        if (
            !result ||
            result.success !== true
        ) {

            forceLogoutAdmin(
                "Session admin tidak valid."
            );

        }

    } catch (error) {

        console.warn(
            "Touch session gagal:",
            error
        );

    }

}


/* ============================================================
   22. AKTIVITAS ADMIN
   ============================================================ */

function registerAdminActivity() {

    resetAdminIdleTimer();

    touchAdminSessionServer();

}


/* ============================================================
   23. SETUP AUTO LOGOUT
   ============================================================ */

function setupAdminIdleLogout() {

    const events = [

        "click",

        "keydown",

        "mousemove",

        "scroll",

        "touchstart"

    ];

    events.forEach(
        function (eventName) {

            document.addEventListener(
                eventName,
                registerAdminActivity,
                {
                    passive: true
                }
            );

        }
    );

    resetAdminIdleTimer();

}


/* ============================================================
   24. LOAD MASTER DATA CABANG
   ============================================================ */

async function loadCabangMasterData() {

    if (!filterCabang) {

        return;

    }

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
                result.message ||
                "MASTER_DATA gagal dimuat."
            );

        }

        filterCabang.innerHTML =
            '<option value="">Semua Cabang</option>';

        const cabang =
            Array.isArray(result.cabang)
                ? result.cabang
                : [];

        cabang.forEach(
            function (item) {

                const kode =
                    String(
                        item.kode || ""
                    ).trim();

                const nama =
                    String(
                        item.nama || ""
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
                        ? kode + " - " + nama
                        : kode;

                option.dataset.nama =
                    nama;

                filterCabang.appendChild(
                    option
                );

            }
        );

        console.log(
            "MASTER CABANG:",
            cabang
        );

    } catch (error) {

        console.error(
            "Gagal memuat master cabang:",
            error
        );

    }

}


/* ============================================================
   25. LOAD SOW
   ============================================================ */

async function loadTeknisiAdmin() {

    if (!teknisiTableBody) {

        return;

    }

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
                result.message ||
                "Data SOW gagal dimuat."
            );

        }

        daftarSow =
            Array.isArray(result.teknisi)
                ? result.teknisi
                : [];

        renderTeknisiAdmin(
            daftarSow
        );

        updateSelectTeknisi();

    } catch (error) {

        console.error(
            "Gagal load SOW:",
            error
        );

        teknisiTableBody.innerHTML = `
            <tr>
                <td colspan="4">
                    Gagal memuat data SOW.
                </td>
            </tr>
        `;

    }

}


/* ============================================================
   26. RENDER DATA SOW
   ============================================================ */

function renderTeknisiAdmin(list) {

    if (!teknisiTableBody) {

        return;

    }

    teknisiTableBody.innerHTML = "";

    if (
        !list ||
        list.length === 0
    ) {

        teknisiTableBody.innerHTML = `
            <tr>
                <td colspan="4">
                    Belum ada data SOW.
                </td>
            </tr>
        `;

        return;

    }

    list.forEach(
        function (item) {

            const id =
                item.id ||
                item.kode ||
                "";

            const nama =
                item.nama ||
                "";

            const status =
                item.status ||
                "AKTIF";

            const tanggalUpdate =
                item.tanggal_update ||
                "-";

            const tr =
                document.createElement(
                    "tr"
                );

            tr.innerHTML = `

                <td>
                    ${escapeHtml(id)}
                </td>

                <td>
                    ${escapeHtml(nama)}
                </td>

                <td>
                    <span class="status
                        ${escapeHtml(
                            String(status).toLowerCase()
                        )}">
                        ${escapeHtml(status)}
                    </span>
                </td>

                <td>
                    ${escapeHtml(
                        formatTanggalJam(
                            tanggalUpdate
                        )
                    )}
                </td>

            `;

            teknisiTableBody.appendChild(
                tr
            );

        }
    );

}


/* ============================================================
   27. UPDATE SELECT SOW
   ============================================================ */

function updateSelectTeknisi() {

    if (!updateTeknisi) {

        return;

    }

    const nilaiLama =
        updateTeknisi.value;

    updateTeknisi.innerHTML =
        '<option value="">-- Pilih SOW --</option>';

    daftarSow.forEach(
        function (item) {

            const status =
                String(
                    item.status ||
                    "AKTIF"
                )
                    .trim()
                    .toUpperCase();

            if (
                status !== "AKTIF"
            ) {

                return;

            }

            const value =
                item.nama ||
                item.id ||
                "";

            if (!value) {

                return;

            }

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                value;

            option.textContent =
                item.nama ||
                value;

            updateTeknisi.appendChild(
                option
            );

        }
    );

    if (nilaiLama) {

        const ada =
            Array.from(
                updateTeknisi.options
            ).some(
                function (option) {

                    return (
                        option.value ===
                        nilaiLama
                    );

                }
            );

        if (ada) {

            updateTeknisi.value =
                nilaiLama;

        }

    }

}


/* ============================================================
   28. LOAD ORDERS
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

    try {

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

        const result =
            await apiGet(params);

        if (
            !result ||
            result.success !== true
        ) {

            if (
                result &&
                (
                    result.sessionExpired ||
                    result.code === "SESSION_EXPIRED"
                )
            ) {

                forceLogoutAdmin(
                    "Session admin sudah berakhir."
                );

                return;

            }

            throw new Error(
                result?.message ||
                "Gagal mengambil data order."
            );

        }

        semuaOrders =
            Array.isArray(result.orders)
                ? result.orders
                : [];

        updateStatistics(
            result.statistik || {}
        );

        renderOrders(
            semuaOrders
        );

    } catch (error) {

        console.error(
            "LOAD ORDERS ERROR:",
            error
        );

        orderTableBody.innerHTML = `
            <tr>
                <td colspan="9">
                    Gagal memuat data order.
                    <br>
                    ${escapeHtml(error.message)}
                </td>
            </tr>
        `;

    }

}


/* ============================================================
   29. RENDER ORDERS
   ============================================================ */

function renderOrders(orders) {

    orderTableBody.innerHTML = "";

    if (
        !orders ||
        orders.length === 0
    ) {

        orderTableBody.innerHTML = `
            <tr>
                <td colspan="9">
                    Belum ada data order.
                </td>
            </tr>
        `;

        return;

    }

    orders.forEach(
        function (order, index) {

            const tr =
                document.createElement(
                    "tr"
                );

            const status =
                order.status ||
                "OPEN";

            const cabang =
                order.nama_cabang
                    ? (
                        order.kode_cabang +
                        " - " +
                        order.nama_cabang
                    )
                    : (
                        order.kode_cabang ||
                        "-"
                    );

            tr.innerHTML = `

                <td>
                    ${index + 1}
                </td>

                <td>
                    <strong>
                        ${escapeHtml(
                            order.kode || "-"
                        )}
                    </strong>
                </td>

                <td>
                    ${escapeHtml(
                        order.nama || "-"
                    )}
                </td>

                <td>
                    ${escapeHtml(
                        cabang
                    )}
                </td>

                <td>
                    ${escapeHtml(
                        order.jenis_kendala ||
                        "-"
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
                    <span class="status
                        ${escapeHtml(
                            String(status)
                                .toLowerCase()
                        )}">
                        ${escapeHtml(status)}
                    </span>
                </td>

                <td>
                    ${escapeHtml(
                        order.teknisi ||
                        order.sow ||
                        "-"
                    )}
                </td>

                <td>

                    <button
                        type="button"
                        class="btn-detail"
                        onclick="lihatDetail('${escapeAttribute(
                            order.kode || ""
                        )}')">

                        Detail

                    </button>

                </td>

            `;

            orderTableBody.appendChild(
                tr
            );

        }
    );

}


/* ============================================================
   30. UPDATE STATISTIK
   ============================================================ */

function updateStatistics(statistik) {

    if (totalOrder) {

        totalOrder.textContent =
            statistik.total || 0;

    }

    if (totalOpen) {

        totalOpen.textContent =
            statistik.open || 0;

    }

    if (totalProses) {

        totalProses.textContent =
            statistik.proses || 0;

    }

    if (totalSelesai) {

        totalSelesai.textContent =
            statistik.selesai || 0;

    }

}


/* ============================================================
   31. LIHAT DETAIL ORDER
   ============================================================ */

function lihatDetail(kode) {

    const order =
        semuaOrders.find(
            function (item) {

                return (
                    String(item.kode) ===
                    String(kode)
                );

            }
        );

    if (!order) {

        alert(
            "Data order tidak ditemukan."
        );

        return;

    }

    orderAktif =
        order;

    const cabang =
        order.nama_cabang
            ? (
                order.kode_cabang +
                " - " +
                order.nama_cabang
            )
            : (
                order.kode_cabang ||
                "-"
            );

    if (detailKode) {

        detailKode.textContent =
            order.kode || "-";

    }

    if (detailNama) {

        detailNama.textContent =
            order.nama || "-";

    }

    if (detailUnitKerja) {

        detailUnitKerja.textContent =
            order.unit_kerja ||
            order.nip ||
            "-";

    }

    if (detailCabang) {

        detailCabang.textContent =
            cabang;

    }

    if (detailJenisKendala) {

        detailJenisKendala.textContent =
            order.jenis_kendala ||
            "-";

    }

    if (detailDeskripsi) {

        detailDeskripsi.textContent =
            order.deskripsi ||
            "-";

    }

    if (detailWhatsapp) {

        detailWhatsapp.textContent =
            order.whatsapp ||
            "-";

    }

    if (detailTanggal) {

        detailTanggal.textContent =
            formatTanggalTampilan(
                order.tanggal
            );

    }

    if (detailJam) {

        detailJam.textContent =
            order.jam ||
            "-";

    }

    if (detailStatus) {

        detailStatus.textContent =
            order.status ||
            "OPEN";

    }

    if (detailTeknisi) {

        detailTeknisi.textContent =
            order.teknisi ||
            order.sow ||
            "-";

    }

    if (detailCatatan) {

        detailCatatan.textContent =
            order.catatan_progres ||
            order.catatan ||
            "-";

    }

    if (detailTanggalUpdate) {

        detailTanggalUpdate.textContent =
            order.tanggal_update ||
            "-";

    }

    if (detailRiwayat) {

        detailRiwayat.textContent =
            order.riwayat_status ||
            "Belum ada riwayat.";

    }

    if (updateStatus) {

        updateStatus.value =
            order.status ||
            "OPEN";

    }

    if (updateTeknisi) {

        updateTeknisi.value =
            order.teknisi ||
            order.sow ||
            "";

    }

    if (updateCatatan) {

        updateCatatan.value =
            order.catatan_progres ||
            order.catatan ||
            "";

    }

    if (detailModal) {

        detailModal.style.display =
            "flex";

    }

}


/* ============================================================
   32. TUTUP DETAIL MODAL
   ============================================================ */

function tutupDetailModal() {

    if (detailModal) {

        detailModal.style.display =
            "none";

    }

    orderAktif =
        null;

}


/* ============================================================
   33. UPDATE ORDER
   ============================================================ */

async function simpanUpdateOrder() {

    if (!orderAktif) {

        alert(
            "Order belum dipilih."
        );

        return;

    }

    if (!saveUpdateButton) {

        return;

    }

    const statusBaru =
        updateStatus
            ? updateStatus.value.trim()
            : "";

    const teknisiBaru =
        updateTeknisi
            ? updateTeknisi.value.trim()
            : "";

    const catatanBaru =
        updateCatatan
            ? updateCatatan.value.trim()
            : "";

    if (!statusBaru) {

        alert(
            "Status wajib dipilih."
        );

        return;

    }

    const konfirmasi =
        confirm(
            "Simpan perubahan order " +
            orderAktif.kode +
            "?"
        );

    if (!konfirmasi) {

        return;

    }

    const teksAwal =
        saveUpdateButton.textContent;

    saveUpdateButton.disabled =
        true;

    saveUpdateButton.textContent =
        "Menyimpan...";

    try {

        const result =
            await apiPost({

                action:
                    "updateStatus",

                token:
                    ADMIN_TOKEN,

                kode:
                    orderAktif.kode,

                status:
                    statusBaru,

                teknisi:
                    teknisiBaru,

                sow:
                    teknisiBaru,

                catatan:
                    catatanBaru,

                catatan_progres:
                    catatanBaru

            });

        if (
            !result ||
            result.success !== true
        ) {

            if (
                result &&
                (
                    result.sessionExpired ||
                    result.code ===
                    "SESSION_EXPIRED"
                )
            ) {

                forceLogoutAdmin(
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
            "Order berhasil diperbarui."
        );

        tutupDetailModal();

        await loadOrders();

    } catch (error) {

        console.error(
            "UPDATE ORDER ERROR:",
            error
        );

        alert(
            "Gagal memperbarui order.\n\n" +
            error.message
        );

    } finally {

        saveUpdateButton.disabled =
            false;

        saveUpdateButton.textContent =
            teksAwal;

    }

}


/* ============================================================
   34. RESET FILTER
   ============================================================ */

function resetSemuaFilter() {

    if (searchOrder) {

        searchOrder.value =
            "";

    }

    if (filterCabang) {

        filterCabang.value =
            "";

    }

    if (filterTanggalMulai) {

        filterTanggalMulai.value =
            "";

    }

    if (filterTanggalSampai) {

        filterTanggalSampai.value =
            "";

    }

    loadOrders();

}


/* ============================================================
   35. BUKA MENU SIDEBAR
   ============================================================ */

function bukaSidebar() {

    if (adminSidebar) {

        adminSidebar.classList.add(
            "active"
        );

    }

    if (sidebarOverlay) {

        sidebarOverlay.classList.add(
            "active"
        );

    }

}


/* ============================================================
   36. TUTUP SIDEBAR
   ============================================================ */

function tutupSidebar() {

    if (adminSidebar) {

        adminSidebar.classList.remove(
            "active"
        );

    }

    if (sidebarOverlay) {

        sidebarOverlay.classList.remove(
            "active"
        );

    }

}


/* ============================================================
   37. SET MODE HALAMAN
   ============================================================ */

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


/* ============================================================
   38. SET MENU AKTIF
   ============================================================ */

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


/* ============================================================
   39. NAVIGASI SIDEBAR
   ============================================================ */

function bukaMenu(target) {

    if (
        target === "dashboard"
    ) {

        setModeHalaman(
            "dashboard"
        );

        setMenuAktif(
            "dashboard"
        );

        loadOrders();

    }

    else if (
        target === "rekap"
    ) {

        setModeHalaman(
            "rekap"
        );

        setMenuAktif(
            "rekap"
        );

    }

    else if (
        target === "teknisi"
    ) {

        setModeHalaman(
            "teknisi"
        );

        setMenuAktif(
            "teknisi"
        );

        loadTeknisiAdmin();

    }

    tutupSidebar();

}


/* ============================================================
   40. LOAD REKAP
   ============================================================ */

async function loadRekap() {

    if (!rekapResult) {

        return;

    }

    const tipe =
        rekapPeriodForm
            ? (
                rekapPeriodForm.value ||
                "bulanan"
            )
            : "bulanan";

    periodeRekapTerakhir =
        tipe;

    rekapResult.innerHTML = `
        <div class="rekap-loading">
            Memuat rekap laporan...
        </div>
    `;

    try {

        const result =
            await apiGet({

                token:
                    ADMIN_TOKEN,

                rekap:
                    "true",

                tipe:
                    tipe

            });

        if (
            !result ||
            result.success !== true
        ) {

            throw new Error(
                result?.message ||
                "Rekap gagal dimuat."
            );

        }

        hasilRekapTerakhir =
            result;

        renderRekap(
            result
        );

    } catch (error) {

        console.error(
            "REKAP ERROR:",
            error
        );

        rekapResult.innerHTML = `
            <div class="rekap-empty">

                <h3>
                    Rekap Gagal
                </h3>

                <p>
                    ${escapeHtml(
                        error.message
                    )}
                </p>

            </div>
        `;

    }

}


/* ============================================================
   41. RENDER REKAP
   ============================================================ */

function renderRekap(result) {

    if (!rekapResult) {

        return;

    }

    const statistik =
        result.statistik ||
        {};

    const orders =
        Array.isArray(result.orders)
            ? result.orders
            : [];

    const rekapCabang =
        Array.isArray(
            result.rekapCabang
        )
            ? result.rekapCabang
            : [];

    const rekapTeknisi =
        Array.isArray(
            result.rekapTeknisi
        )
            ? result.rekapTeknisi
            : [];

    let html = `

        <div class="rekap-summary">

            <div class="rekap-summary-card">
                <span>Total</span>
                <strong>
                    ${statistik.total || 0}
                </strong>
            </div>

            <div class="rekap-summary-card">
                <span>Open</span>
                <strong>
                    ${statistik.open || 0}
                </strong>
            </div>

            <div class="rekap-summary-card">
                <span>Proses</span>
                <strong>
                    ${statistik.proses || 0}
                </strong>
            </div>

            <div class="rekap-summary-card">
                <span>Selesai</span>
                <strong>
                    ${statistik.selesai || 0}
                </strong>
            </div>

        </div>

        <div class="rekap-table-container">

            <h3>
                Rekap Berdasarkan Cabang
            </h3>

            <table class="rekap-table">

                <thead>

                    <tr>

                        <th>
                            Cabang
                        </th>

                        <th>
                            Jumlah
                        </th>

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
                    Tidak ada data.
                </td>

            </tr>

        `;

    } else {

        rekapCabang.forEach(
            function (item) {

                const namaCabang =
                    item.nama ||
                    (
                        item.kode
                            ? item.kode
                            : "-"
                    );

                html += `

                    <tr>

                        <td>
                            ${escapeHtml(
                                namaCabang
                            )}
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


        <div class="rekap-table-container">

            <h3>
                Rekap Berdasarkan SOW
            </h3>

            <table class="rekap-table">

                <thead>

                    <tr>

                        <th>
                            SOW
                        </th>

                        <th>
                            Jumlah
                        </th>

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
                    Tidak ada data.
                </td>

            </tr>

        `;

    } else {

        rekapTeknisi.forEach(
            function (item) {

                html += `

                    <tr>

                        <td>
                            ${escapeHtml(
                                item.nama ||
                                item.teknisi ||
                                "-"
                            )}
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


        <div class="rekap-table-container">

            <h3>
                Detail Laporan
            </h3>

            <div class="table-scroll">

                <table class="rekap-table">

                    <thead>

                        <tr>

                            <th>No</th>
                            <th>Kode Order</th>
                            <th>Nama</th>
                            <th>Unit Kerja</th>
                            <th>Cabang</th>
                            <th>Jenis Kendala</th>
                            <th>Tanggal</th>
                            <th>Status</th>
                            <th>SOW</th>

                        </tr>

                    </thead>

                    <tbody>
    `;

    if (
        orders.length === 0
    ) {

        html += `

            <tr>

                <td colspan="9">
                    Tidak ada laporan.
                </td>

            </tr>

        `;

    } else {

        orders.forEach(
            function (order, index) {

                const cabang =
                    order.nama_cabang
                        ? (
                            order.kode_cabang +
                            " - " +
                            order.nama_cabang
                        )
                        : (
                            order.kode_cabang ||
                            "-"
                        );

                html += `

                    <tr>

                        <td>
                            ${index + 1}
                        </td>

                        <td>
                            ${escapeHtml(
                                order.kode ||
                                "-"
                            )}
                        </td>

                        <td>
                            ${escapeHtml(
                                order.nama ||
                                "-"
                            )}
                        </td>

                        <td>
                            ${escapeHtml(
                                order.unit_kerja ||
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
                                order.jenis_kendala ||
                                "-"
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
                            ${escapeHtml(
                                order.status ||
                                "-"
                            )}
                        </td>

                        <td>
                            ${escapeHtml(
                                order.teknisi ||
                                order.sow ||
                                "-"
                            )}
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
   42. DOWNLOAD REKAP EXCEL
   ============================================================ */

async function downloadRekapExcel() {

    if (
        !hasilRekapTerakhir
    ) {

        alert(
            "Tampilkan rekap terlebih dahulu."
        );

        return;

    }

    if (
        typeof ExcelJS ===
        "undefined"
    ) {

        alert(
            "Library ExcelJS belum tersedia."
        );

        return;

    }

    try {

        const result =
            hasilRekapTerakhir;

        const orders =
            Array.isArray(result.orders)
                ? result.orders
                : [];

        const tipe =
            result.tipe ||
            periodeRekapTerakhir ||
            "bulanan";

        const workbook =
            new ExcelJS.Workbook();

        workbook.creator =
            "SOW IV Denpasar";

        workbook.created =
            new Date();

        const sheet =
            workbook.addWorksheet(
                "Laporan SOW"
            );

        sheet.columns = [

            {
                header: "No",
                key: "no",
                width: 7
            },

            {
                header: "Kode Order",
                key: "kode",
                width: 20
            },

            {
                header: "Nama",
                key: "nama",
                width: 25
            },

            {
                header: "Unit Kerja",
                key: "unit",
                width: 25
            },

            {
                header: "Kode Cabang",
                key: "kode_cabang",
                width: 15
            },

            {
                header: "Nama Cabang",
                key: "nama_cabang",
                width: 30
            },

            {
                header: "Jenis Kendala",
                key: "kendala",
                width: 30
            },

            {
                header: "Tanggal",
                key: "tanggal",
                width: 15
            },

            {
                header: "Jam",
                key: "jam",
                width: 12
            },

            {
                header: "Status",
                key: "status",
                width: 15
            },

            {
                header: "SOW",
                key: "sow",
                width: 25
            },

            {
                header: "Catatan Progres",
                key: "catatan",
                width: 35
            }

        ];

        orders.forEach(
            function (order, index) {

                sheet.addRow({

                    no:
                        index + 1,

                    kode:
                        order.kode ||
                        "",

                    nama:
                        order.nama ||
                        "",

                    unit:
                        order.unit_kerja ||
                        "",

                    kode_cabang:
                        order.kode_cabang ||
                        "",

                    nama_cabang:
                        order.nama_cabang ||
                        "",

                    kendala:
                        order.jenis_kendala ||
                        "",

                    tanggal:
                        formatTanggalTampilan(
                            order.tanggal
                        ),

                    jam:
                        order.jam ||
                        "",

                    status:
                        order.status ||
                        "",

                    sow:
                        order.teknisi ||
                        order.sow ||
                        "",

                    catatan:
                        order.catatan_progres ||
                        ""

                });

            }
        );

        sheet.views = [
            {
                state: "frozen",
                ySplit: 1
            }
        ];

        sheet.autoFilter = {
            from: "A1",
            to: "L1"
        };

        const header =
            sheet.getRow(1);

        header.font = {
            bold: true
        };

        header.alignment = {
            vertical: "middle",
            horizontal: "center"
        };

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
            URL.createObjectURL(
                blob
            );

        const a =
            document.createElement(
                "a"
            );

        a.href =
            url;

        a.download =
            "Laporan_SOW_IV_Denpasar_" +
            tipe +
            "_" +
            new Date()
                .toISOString()
                .slice(0, 10) +
            ".xlsx";

        document.body.appendChild(a);

        a.click();

        a.remove();

        URL.revokeObjectURL(
            url
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


/* ============================================================
   43. TAMBAH SOW
   ============================================================ */

function bukaTambahTeknisi() {

    if (!teknisiModal) {

        return;

    }

    if (teknisiModalTitle) {

        teknisiModalTitle.textContent =
            "Tambah SOW";

    }

    if (teknisiIdInput) {

        teknisiIdInput.value =
            "";

    }

    if (teknisiNamaInput) {

        teknisiNamaInput.value =
            "";

    }

    teknisiModal.style.display =
        "flex";

}


/* ============================================================
   44. EDIT SOW
   ============================================================ */

function editTeknisiAdmin(id) {

    const item =
        daftarSow.find(
            function (row) {

                return String(
                    row.id ||
                    row.kode ||
                    ""
                ) === String(id);

            }
        );

    if (!item) {

        alert(
            "Data SOW tidak ditemukan."
        );

        return;

    }

    if (teknisiModalTitle) {

        teknisiModalTitle.textContent =
            "Edit SOW";

    }

    if (teknisiIdInput) {

        teknisiIdInput.value =
            item.id ||
            item.kode ||
            "";

    }

    if (teknisiNamaInput) {

        teknisiNamaInput.value =
            item.nama ||
            "";

    }

    if (teknisiModal) {

        teknisiModal.style.display =
            "flex";

    }

}


/* ============================================================
   45. TUTUP MODAL SOW
   ============================================================ */

function tutupTeknisiModal() {

    if (teknisiModal) {

        teknisiModal.style.display =
            "none";

    }

}


/* ============================================================
   46. SIMPAN SOW
   ============================================================ */

async function simpanTeknisiAdmin() {

    const id =
        teknisiIdInput
            ? teknisiIdInput.value.trim()
            : "";

    const nama =
        teknisiNamaInput
            ? teknisiNamaInput.value.trim()
            : "";

    if (!nama) {

        alert(
            "Nama SOW wajib diisi."
        );

        return;

    }

    if (!simpanTeknisiButton) {

        return;

    }

    const teksAwal =
        simpanTeknisiButton.textContent;

    simpanTeknisiButton.disabled =
        true;

    simpanTeknisiButton.textContent =
        "Menyimpan...";

    try {

        const result =
            await apiPost({

                action:
                    id
                        ? "updateTeknisi"
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
            "Data SOW berhasil disimpan."
        );

        tutupTeknisiModal();

        await loadTeknisiAdmin();

    } catch (error) {

        console.error(
            "SIMPAN SOW ERROR:",
            error
        );

        alert(
            "Gagal menyimpan SOW.\n\n" +
            error.message
        );

    } finally {

        simpanTeknisiButton.disabled =
            false;

        simpanTeknisiButton.textContent =
            teksAwal;

    }

}


/* ============================================================
   47. UBAH STATUS SOW
   ============================================================ */

async function ubahStatusTeknisiAdmin(
    id,
    status
) {

    if (!id) {

        return;

    }

    try {

        const result =
            await apiPost({

                action:
                    "updateStatusTeknisi",

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

        console.error(
            "STATUS SOW ERROR:",
            error
        );

        alert(
            "Gagal mengubah status SOW.\n\n" +
            error.message
        );

    }

}


/* ============================================================
   48. SETUP EVENT SIDEBAR
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
   49. SETUP EVENT FILTER
   ============================================================ */

function pasangEventFilter() {

    if (searchButton) {

        searchButton.addEventListener(
            "click",
            loadOrders
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

                    event.preventDefault();

                    loadOrders();

                }

            }
        );

    }

    if (filterCabang) {

        filterCabang.addEventListener(
            "change",
            loadOrders
        );

    }

    if (filterTanggalMulai) {

        filterTanggalMulai.addEventListener(
            "change",
            loadOrders
        );

    }

    if (filterTanggalSampai) {

        filterTanggalSampai.addEventListener(
            "change",
            loadOrders
        );

    }

    if (resetFilter) {

        resetFilter.addEventListener(
            "click",
            resetSemuaFilter
        );

    }

}


/* ============================================================
   50. SETUP EVENT DETAIL
   ============================================================ */

function pasangEventDetail() {

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

}


/* ============================================================
   51. SETUP EVENT REKAP
   ============================================================ */

function pasangEventRekap() {

    if (tampilkanRekapButton) {

        tampilkanRekapButton.addEventListener(
            "click",
            loadRekap
        );

    }

    if (downloadRekapExcelButton) {

        downloadRekapExcelButton.addEventListener(
            "click",
            downloadRekapExcel
        );

    }

}


/* ============================================================
   52. SETUP EVENT SOW
   ============================================================ */

function pasangEventSow() {

    if (tambahTeknisiButton) {

        tambahTeknisiButton.addEventListener(
            "click",
            bukaTambahTeknisi
        );

    }

    if (closeTeknisiModal) {

        closeTeknisiModal.addEventListener(
            "click",
            tutupTeknisiModal
        );

    }

    if (batalTeknisiButton) {

        batalTeknisiButton.addEventListener(
            "click",
            tutupTeknisiModal
        );

    }

    if (simpanTeknisiButton) {

        simpanTeknisiButton.addEventListener(
            "click",
            simpanTeknisiAdmin
        );

    }

}


/* ============================================================
   53. SETUP EVENT LOGOUT
   ============================================================ */

function pasangEventLogout() {

    if (!logoutButton) {

        return;

    }

    logoutButton.addEventListener(
        "click",
        async function () {

            const yakin =
                confirm(
                    "Apakah Anda yakin ingin logout?"
                );

            if (!yakin) {

                return;

            }

            try {

                await apiPost({

                    action:
                        "logoutAdmin",

                    token:
                        ADMIN_TOKEN

                });

            } catch (error) {

                console.warn(
                    "Logout server gagal:",
                    error
                );

            }

            logoutAdminLocal();

        }
    );

}


/* ============================================================
   54. SETUP EVENT ESCAPE
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

            tutupDetailModal();

            tutupTeknisiModal();

            tutupSidebar();

        }
    );

}


/* ============================================================
   55. AMBIL ELEMENT DOM
   ============================================================ */

function ambilElementDOM() {

    orderTableBody =
        getElement(
            "orderTableBody"
        );

    totalOrder =
        getElement(
            "totalOrder"
        );

    totalOpen =
        getElement(
            "totalOpen"
        );

    totalProses =
        getElement(
            "totalProses"
        );

    totalSelesai =
        getElement(
            "totalSelesai"
        );

    searchOrder =
        getElement(
            "searchOrder"
        );

    filterCabang =
        getElement(
            "filterCabang"
        );

    filterTanggalMulai =
        getElement(
            "filterTanggalMulai"
        );

    filterTanggalSampai =
        getElement(
            "filterTanggalSampai"
        );

    searchButton =
        getElement(
            "searchButton"
        );

    resetFilter =
        getElement(
            "resetFilter"
        );


    detailModal =
        getElement(
            "detailModal"
        );

    detailKode =
        getElement(
            "detailKode"
        );

    detailNama =
        getElement(
            "detailNama"
        );

    detailUnitKerja =
        getElement(
            "detailUnitKerja"
        );

    detailCabang =
        getElement(
            "detailCabang"
        );

    detailJenisKendala =
        getElement(
            "detailJenisKendala"
        );

    detailDeskripsi =
        getElement(
            "detailDeskripsi"
        );

    detailWhatsapp =
        getElement(
            "detailWhatsapp"
        );

    detailTanggal =
        getElement(
            "detailTanggal"
        );

    detailJam =
        getElement(
            "detailJam"
        );

    detailStatus =
        getElement(
            "detailStatus"
        );

    detailTeknisi =
        getElement(
            "detailTeknisi"
        );

    detailCatatan =
        getElement(
            "detailCatatan"
        );

    detailTanggalUpdate =
        getElement(
            "detailTanggalUpdate"
        );

    detailRiwayat =
        getElement(
            "detailRiwayat"
        );


    updateStatus =
        getElement(
            "updateStatus"
        );

    updateTeknisi =
        getElement(
            "updateTeknisi"
        );

    updateCatatan =
        getElement(
            "updateCatatan"
        );

    saveUpdateButton =
        getElement(
            "saveUpdateButton"
        );

    closeModalButton =
        getElement(
            "closeModalButton"
        );

    closeModal =
        getElement(
            "closeModal"
        );


    rekapPeriodForm =
        getElement(
            "rekapPeriodForm"
        );

    tampilkanRekapButton =
        getElement(
            "tampilkanRekapButton"
        );

    downloadRekapExcelButton =
        getElement(
            "downloadRekapExcelButton"
        );

    rekapResult =
        getElement(
            "rekapResult"
        );


    teknisiTableBody =
        getElement(
            "teknisiTableBody"
        );

    tambahTeknisiButton =
        getElement(
            "tambahTeknisiButton"
        );

    teknisiModal =
        getElement(
            "teknisiModal"
        );

    teknisiModalTitle =
        getElement(
            "teknisiModalTitle"
        );

    closeTeknisiModal =
        getElement(
            "closeTeknisiModal"
        );

    teknisiNamaInput =
        getElement(
            "teknisiNamaInput"
        );

    teknisiIdInput =
        getElement(
            "teknisiIdInput"
        );

    batalTeknisiButton =
        getElement(
            "batalTeknisiButton"
        );

    simpanTeknisiButton =
        getElement(
            "simpanTeknisiButton"
        );


    sidebarMenuButton =
        getElement(
            "sidebarMenuButton"
        );

    sidebarOverlay =
        getElement(
            "sidebarOverlay"
        );

    adminSidebar =
        getElement(
            "adminSidebar"
        );

    sidebarCloseButton =
        getElement(
            "sidebarCloseButton"
        );

    logoutButton =
        getElement(
            "logoutButton"
        );

}


/* ============================================================
   56. INISIALISASI ADMIN DASHBOARD
   ============================================================ */

async function initAdminDashboard() {

    console.log(
        "========================================"
    );

    console.log(
        "MY SOW BALI - ADMIN DASHBOARD"
    );

    console.log(
        "ADMIN JS FINAL CLEAN"
    );

    console.log(
        "========================================"
    );


    /* --------------------------------------------------------
       Ambil element
       -------------------------------------------------------- */

    ambilElementDOM();


    /* --------------------------------------------------------
       Mode awal = Dashboard
       -------------------------------------------------------- */

    setModeHalaman(
        "dashboard"
    );

    setMenuAktif(
        "dashboard"
    );


    /* --------------------------------------------------------
       Pasang event
       -------------------------------------------------------- */

    pasangEventSidebar();

    pasangEventFilter();

    pasangEventDetail();

    pasangEventRekap();

    pasangEventSow();

    pasangEventLogout();

    pasangEventEscape();


    /* --------------------------------------------------------
       Auto logout
       -------------------------------------------------------- */

    setupAdminIdleLogout();


    /* --------------------------------------------------------
       Load master
       -------------------------------------------------------- */

    await loadCabangMasterData();


    /* --------------------------------------------------------
       Load SOW
       -------------------------------------------------------- */

    await loadTeknisiAdmin();


    /* --------------------------------------------------------
       Load order
       -------------------------------------------------------- */

    await loadOrders();


    console.log(
        "ADMIN DASHBOARD SIAP."
    );

}


/* ============================================================
   57. DOM READY
   ============================================================ */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        initAdminDashboard();

    }
);


/* ============================================================
   58. GLOBAL FUNCTION
   Dipakai oleh onclick dari HTML
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