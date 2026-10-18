/* ============================================================
 * MY SOW BALI - ADMIN DASHBOARD
 * FINAL SYNC
 * Dashboard + Detail + SOW + Rekap + Excel
 * ============================================================ */

const API_URL =
    "https://script.google.com/macros/s/AKfycbwMyIJyYAX2Ioik1Bv_TM5lx-XgLdmhay0vwbl3jNc_rQ7fN_ShL3rPbEAefk381_o/exec";

const TOKEN_KEY = "MY_SOW_ADMIN_TOKEN";
const ADMIN_TOKEN = localStorage.getItem(TOKEN_KEY);

const ADMIN_IDLE_MS = 10 * 60 * 1000;

if (!ADMIN_TOKEN) {
    window.location.replace("login.html");
}


/* ============================================================
 * VARIABEL GLOBAL
 * ============================================================ */

let semuaOrders = [];
let daftarSOW = [];
let orderAktif = null;

let periodeRekapAktif = "harian";
let hasilRekapTerakhir = null;

let lastActivity = Date.now();
let idleTimer = null;
let logoutInProgress = false;


/* ============================================================
 * HELPER DOM
 * ============================================================ */

const $ = (id) =>
    document.getElementById(id);


/* ============================================================
 * HELPER ESCAPE HTML
 * ============================================================ */

const esc = (value) =>
    String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");


/* ============================================================
 * AMBIL VALUE INPUT
 * ============================================================ */

const val = (id) =>
    $(id)?.value?.trim() || "";


/* ============================================================
 * FORMAT TANGGAL
 * ============================================================ */

function formatTanggalTampilan(value) {

    if (!value) {
        return "-";
    }

    const text =
        String(value).trim();

    if (
        /^\d{4}-\d{2}-\d{2}$/.test(text)
    ) {

        const [tahun, bulan, tanggal] =
            text.split("-");

        return (
            tanggal +
            "/" +
            bulan +
            "/" +
            tahun
        );
    }

    const date =
        new Date(text);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return text;
    }

    return date.toLocaleDateString(
        "id-ID",
        {
            timeZone: "Asia/Makassar",
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }
    );
}


/* ============================================================
 * FORMAT TANGGAL + JAM
 * ============================================================ */

function formatTanggalWaktu(value) {

    if (!value) {
        return "-";
    }

    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return String(value);
    }

    return date.toLocaleString(
        "id-ID",
        {
            timeZone: "Asia/Makassar",
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}


/* ============================================================
 * FORMAT CLASS STATUS
 * ============================================================ */

function statusClass(status) {

    return String(
        status || "OPEN"
    )
        .toLowerCase()
        .replace(
            /\s+/g,
            "-"
        );
}


/* ============================================================
 * LOGOUT ADMIN
 * ============================================================ */

function logoutAdmin(
    reason = "Sesi admin berakhir"
) {

    if (logoutInProgress) {
        return;
    }

    logoutInProgress = true;

    localStorage.removeItem(
        TOKEN_KEY
    );

    try {

        fetch(
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
                            "logoutAdmin",

                        token:
                            ADMIN_TOKEN
                    })
            }
        ).catch(
            () => { }
        );

    } finally {

        console.warn(
            reason
        );

        window.location.replace(
            "login.html"
        );
    }
}


/* ============================================================
 * RESET TIMER AUTO LOGOUT
 * ============================================================ */

function resetIdleTimer() {

    lastActivity =
        Date.now();

    clearTimeout(
        idleTimer
    );

    idleTimer =
        setTimeout(
            function () {

                if (
                    Date.now() -
                    lastActivity >=
                    ADMIN_IDLE_MS
                ) {

                    logoutAdmin(
                        "Tidak ada aktivitas selama 10 menit."
                    );
                }

            },
            ADMIN_IDLE_MS + 500
        );
}


/* ============================================================
 * SENTUH SESSION ADMIN
 * ============================================================ */

async function touchSession() {

    try {

        const result =
            await postJSON(
                {
                    action:
                        "touchAdminSession",

                    token:
                        ADMIN_TOKEN
                }
            );

        if (
            result?.unauthorized
        ) {

            logoutAdmin(
                "Sesi admin tidak valid."
            );
        }

    } catch (error) {

        console.warn(
            "Touch session:",
            error
        );
    }
}


/* ============================================================
 * GET API
 * ============================================================ */

async function getJSON(
    params = {}
) {

    const query =
        new URLSearchParams(
            {
                token:
                    ADMIN_TOKEN,

                ...params
            }
        );

    const response =
        await fetch(
            API_URL +
            "?" +
            query.toString()
        );

    if (!response.ok) {

        throw new Error(
            "HTTP " +
            response.status
        );
    }

    const result =
        await response.json();

    if (
        result.unauthorized
    ) {

        logoutAdmin(
            "Sesi admin tidak valid."
        );

        throw new Error(
            "Sesi admin berakhir."
        );
    }

    if (
        result.success === false
    ) {

        throw new Error(
            result.message ||
            "Permintaan gagal."
        );
    }

    return result;
}


/* ============================================================
 * POST API
 * ============================================================ */

async function postJSON(
    body
) {

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
                    JSON.stringify(body)
            }
        );

    if (!response.ok) {

        throw new Error(
            "HTTP " +
            response.status
        );
    }

    const result =
        await response.json();

    if (
        result.unauthorized
    ) {

        logoutAdmin(
            "Sesi admin tidak valid."
        );

        throw new Error(
            "Sesi admin berakhir."
        );
    }

    return result;
}


/* ============================================================
 * LOAD MASTER CABANG
 * ============================================================ */

async function loadCabangMasterData() {

    try {

        const result =
            await getJSON(
                {
                    master:
                        "true"
                }
            );

        const select =
            $("filterCabang");

        if (!select) {
            return;
        }

        const current =
            select.value;

        select.innerHTML =
            `
        <option value="">
          Semua Cabang
        </option>
      `;

        (
            result.cabang ||
            []
        ).forEach(
            function (cabang) {

                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    cabang.kode ||
                    cabang.k ||
                    cabang.kode_cabang ||
                    "";

                option.textContent =
                    cabang.nama
                        ? (
                            option.value +
                            " - " +
                            cabang.nama
                        )
                        : (
                            cabang.nama_cabang ||
                            option.value
                        );

                select.appendChild(
                    option
                );
            }
        );

        if (current) {

            select.value =
                current;
        }

    } catch (error) {

        console.error(
            "Master cabang:",
            error
        );
    }
}


/* ============================================================
 * LOAD ORDER
 * ============================================================ */

async function loadOrders() {

    const table =
        $("orderTableBody");

    if (table) {

        table.innerHTML =
            `
        <tr>
          <td colspan="9">
            Memuat data order...
          </td>
        </tr>
      `;
    }

    try {

        const result =
            await getJSON(
                {
                    kode:
                        val("searchOrder"),

                    cabang:
                        val("filterCabang"),

                    tanggalMulai:
                        val(
                            "filterTanggalMulai"
                        ),

                    tanggalSampai:
                        val(
                            "filterTanggalSampai"
                        )
                }
            );

        semuaOrders =
            Array.isArray(
                result.orders
            )
                ? result.orders
                : [];

        updateStatistics(
            result.statistik ||
            {}
        );

        renderOrders(
            semuaOrders
        );

    } catch (error) {

        console.error(
            "LOAD ORDER:",
            error
        );

        if (table) {

            table.innerHTML =
                `
          <tr>
            <td colspan="9">
              ❌ Gagal memuat data:
              ${esc(error.message)}
            </td>
          </tr>
        `;
        }

        updateStatistics(
            {}
        );
    }
}


/* ============================================================
 * UPDATE STATISTIK DASHBOARD
 * ============================================================ */

function updateStatistics(
    statistik
) {

    $("totalOrder").textContent =
        Number(
            statistik.total || 0
        );

    $("totalOpen").textContent =
        Number(
            statistik.open || 0
        );

    $("totalProses").textContent =
        Number(
            statistik.proses || 0
        );

    $("totalSelesai").textContent =
        Number(
            statistik.selesai || 0
        );
}


/* ============================================================
 * RENDER ORDER
 * ============================================================ */

function renderOrders(
    orders
) {

    const table =
        $("orderTableBody");

    if (!table) {
        return;
    }

    if (
        !orders ||
        orders.length === 0
    ) {

        table.innerHTML =
            `
        <tr>
          <td colspan="9">
            Belum ada data order.
          </td>
        </tr>
      `;

        return;
    }

    table.innerHTML =
        orders
            .map(
                function (
                    order,
                    index
                ) {

                    return `
            <tr>

              <td>
                ${index + 1}
              </td>

              <td>
                ${esc(order.kode)}
              </td>

              <td>
                ${esc(order.nama)}
              </td>

              <td>
                ${esc(
                        order.kode_cabang ||
                        order.cabang
                    )}
              </td>

              <td>
                ${esc(
                        order.jenis_kendala
                    )}
              </td>

              <td>
                ${esc(
                        formatTanggalTampilan(
                            order.tanggal
                        )
                    )}
              </td>

              <td>
                <span
                  class="status-${statusClass(
                        order.status
                    )}"
                >
                  ${esc(
                        order.status ||
                        "OPEN"
                    )}
                </span>
              </td>

              <td>
                ${esc(
                        order.sow ||
                        order.teknisi
                    )}
              </td>

              <td>
                <button
                  type="button"
                  onclick="lihatDetail('${esc(
                        String(
                            order.kode ||
                            ""
                        )
                    )}')"
                >
                  👁️ Detail
                </button>
              </td>

            </tr>
          `;
                }
            )
            .join("");
}


/* ============================================================
 * CARI ORDER AKTIF
 * ============================================================ */

function findOrder(
    kode
) {

    return semuaOrders.find(
        function (order) {

            return (
                String(
                    order.kode
                ) ===
                String(kode)
            );
        }
    );
}


/* ============================================================
 * TAMPILKAN DETAIL ORDER
 * ============================================================ */

function lihatDetail(
    kode
) {

    const order =
        findOrder(kode);

    if (!order) {

        alert(
            "Data order tidak ditemukan."
        );

        return;
    }

    orderAktif =
        order;

    $("detailKode").textContent =
        order.kode || "-";

    $("detailNama").textContent =
        order.nama || "-";

    $("detailUnitKerja").textContent =
        order.unit_kerja || "-";

    $("detailCabang").textContent =
        order.cabang ||
        order.kode_cabang ||
        "-";

    $("detailJenisKendala").textContent =
        order.jenis_kendala ||
        "-";

    $("detailDeskripsi").textContent =
        order.deskripsi ||
        "-";

    $("detailWhatsapp").textContent =
        order.whatsapp ||
        "-";

    $("detailTanggal").textContent =
        formatTanggalTampilan(
            order.tanggal
        );

    $("detailJam").textContent =
        order.jam ||
        "-";

    $("detailStatus").textContent =
        order.status ||
        "OPEN";

    $("detailTeknisi").textContent =
        order.sow ||
        order.teknisi ||
        "-";

    $("detailCatatan").textContent =
        order.catatan_progres ||
        "-";

    $("detailTanggalUpdate").textContent =
        formatTanggalWaktu(
            order.tanggal_update
        );

    renderRiwayatTimeline(
        order.riwayat_status
    );

    $("updateStatus").value =
        order.status ||
        "OPEN";

    $("updateTeknisi").value =
        order.sow ||
        order.teknisi ||
        "";

    $("updateCatatan").value =
        order.catatan_progres ||
        "";

    $("detailModal")?.classList.add(
        "show"
    );
}


/* ============================================================
 * RENDER RIWAYAT STATUS
 * ============================================================ */

function renderRiwayatTimeline(
    riwayat
) {

    const element =
        $("detailRiwayat");

    if (!element) {
        return;
    }

    if (!riwayat) {

        element.innerHTML =
            "<div>-</div>";

        return;
    }

    const lines =
        Array.isArray(
            riwayat
        )
            ? riwayat
            : String(
                riwayat
            )
                .split(/\r?\n/)
                .filter(
                    Boolean
                );

    element.innerHTML =
        lines
            .map(
                function (line) {

                    return `
            <div class="riwayat-item">
              ${esc(line)}
            </div>
          `;
                }
            )
            .join("");
}


/* ============================================================
 * TUTUP MODAL DETAIL
 * ============================================================ */

function tutupModal() {

    $("detailModal")?.classList.remove(
        "show"
    );

    orderAktif =
        null;
}


/* ============================================================
 * SIMPAN UPDATE ORDER
 * ============================================================ */

async function simpanUpdateOrder() {

    if (!orderAktif) {

        alert(
            "Silakan buka Detail Order terlebih dahulu."
        );

        return;
    }

    const button =
        $("saveUpdateButton");

    const payload =
    {
        action:
            "updateOrder",

        token:
            ADMIN_TOKEN,

        kode_order:
            orderAktif.kode,

        kode:
            orderAktif.kode,

        status:
            val("updateStatus"),

        sow:
            val("updateTeknisi"),

        teknisi:
            val("updateTeknisi"),

        catatan_progres:
            val("updateCatatan"),

        catatan:
            val("updateCatatan")
    };

    button.disabled =
        true;

    try {

        const result =
            await postJSON(
                payload
            );

        if (
            !result.success
        ) {

            throw new Error(
                result.message ||
                "Gagal memperbarui order."
            );
        }

        alert(
            result.message ||
            "Order berhasil diperbarui."
        );

        tutupModal();

        await loadOrders();

    } catch (error) {

        console.error(
            "UPDATE ORDER:",
            error
        );

        alert(
            "❌ " +
            error.message
        );

    } finally {

        button.disabled =
            false;
    }
}


/* ============================================================
 * FORM PERIODE REKAP
 * ============================================================ */

function tampilkanFormPeriode(
    periode
) {

    periodeRekapAktif =
        periode;

    const form =
        $("rekapPeriodForm");

    if (!form) {
        return;
    }

    const sekarang =
        new Date();

    const isoDate =
        function (date) {

            const local =
                new Date(
                    date.getTime() -
                    date.getTimezoneOffset() *
                    60000
                );

            return local
                .toISOString()
                .slice(
                    0,
                    10
                );
        };

    const tahun =
        sekarang.getFullYear();

    const bulan =
        String(
            sekarang.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    /* ============================
     * HARIAN
     * ============================ */

    if (
        periode ===
        "harian"
    ) {

        form.innerHTML =
            `
        <div class="rekap-info">

          <strong>
            Periode Rekap
          </strong>

          <span>
            Harian
          </span>

        </div>

        <label>
          Tanggal

          <input
            id="rekapTanggal"
            type="date"
            value="${isoDate(
                sekarang
            )}"
          >
        </label>
      `;

        return;
    }


    /* ============================
     * MINGGUAN
     * ============================ */

    if (
        periode ===
        "mingguan"
    ) {

        const mulai =
            new Date(
                sekarang
            );

        mulai.setDate(
            sekarang.getDate() -
            6
        );

        form.innerHTML =
            `
        <div class="rekap-info">

          <strong>
            Periode Rekap
          </strong>

          <span>
            Mingguan
          </span>

        </div>

        <label>
          Tanggal Mulai

          <input
            id="rekapTanggalMulai"
            type="date"
            value="${isoDate(
                mulai
            )}"
          >
        </label>

        <label>
          Tanggal Sampai

          <input
            id="rekapTanggalSampai"
            type="date"
            value="${isoDate(
                sekarang
            )}"
          >
        </label>
      `;

        return;
    }


    /* ============================
     * BULANAN
     * ============================ */

    if (
        periode ===
        "bulanan"
    ) {

        form.innerHTML =
            `
        <div class="rekap-info">

          <strong>
            Periode Rekap
          </strong>

          <span>
            Bulanan
          </span>

        </div>

        <label>
          Bulan

          <input
            id="rekapBulan"
            type="month"
            value="${tahun}-${bulan}"
          >
        </label>
      `;

        return;
    }


    /* ============================
     * TAHUNAN
     * ============================ */

    if (
        periode ===
        "tahunan"
    ) {

        form.innerHTML =
            `
        <div class="rekap-info">

          <strong>
            Periode Rekap
          </strong>

          <span>
            Tahunan
          </span>

        </div>

        <label>
          Tahun

          <input
            id="rekapTahun"
            type="number"
            min="2020"
            max="2100"
            value="${tahun}"
          >
        </label>
      `;
    }
}


/* ============================================================
 * AMBIL REKAP DARI BACKEND
 * ============================================================ */

async function ambilRekap() {

    const params =
    {
        rekap:
            "true",

        tipe:
            periodeRekapAktif
    };


    if (
        periodeRekapAktif ===
        "harian"
    ) {

        params.tanggal =
            val(
                "rekapTanggal"
            );
    }


    if (
        periodeRekapAktif ===
        "mingguan"
    ) {

        params.tanggalMulai =
            val(
                "rekapTanggalMulai"
            );

        params.tanggalSampai =
            val(
                "rekapTanggalSampai"
            );

        if (
            !params.tanggalMulai ||
            !params.tanggalSampai
        ) {

            alert(
                "Lengkapi tanggal periode."
            );

            return;
        }
    }


    if (
        periodeRekapAktif ===
        "bulanan"
    ) {

        const bulan =
            val(
                "rekapBulan"
            );

        if (!bulan) {

            alert(
                "Pilih bulan terlebih dahulu."
            );

            return;
        }

        const bagian =
            bulan.split("-");

        params.tahun =
            bagian[0];

        params.bulan =
            bagian[1];
    }


    if (
        periodeRekapAktif ===
        "tahunan"
    ) {

        params.tahun =
            val(
                "rekapTahun"
            );

        if (!params.tahun) {

            alert(
                "Masukkan tahun."
            );

            return;
        }
    }


    const resultBox =
        $("rekapResult");

    if (resultBox) {

        resultBox.innerHTML =
            `
        <div class="rekap-empty">

          <h3>
            Memuat rekap...
          </h3>

        </div>
      `;
    }


    try {

        hasilRekapTerakhir =
            await getJSON(
                params
            );

        tampilkanHasilRekap(
            hasilRekapTerakhir,
            periodeRekapAktif
        );

    } catch (error) {

        console.error(
            "REKAP:",
            error
        );

        if (resultBox) {

            resultBox.innerHTML =
                `
          <div class="rekap-empty">

            <h3>
              Gagal memuat rekap
            </h3>

            <p>
              ${esc(
                    error.message
                )}
            </p>

          </div>
        `;
        }
    }
}

/* ============================================================
   FORMAT PERIODE REKAP
   Mencegah tampilan [object Object] pada halaman dan Excel.
   ============================================================ */
function formatPeriodeRekap(value) {
    if (value === null || value === undefined || value === "") {
        return "-";
    }

    if (typeof value === "string" || typeof value === "number") {
        return String(value);
    }

    if (typeof value !== "object") {
        return "-";
    }

    // Jika backend mengirim label periode sebagai teks.
    const label =
        value.labelPeriode ||
        value.label ||
        value.periodeText ||
        value.namaPeriode ||
        value.text;

    if (typeof label === "string" && label.trim()) {
        return label.trim();
    }

    // Jika periode dikirim sebagai objek bulan dan tahun.
    const bulanNama = [
        "Januari", "Februari", "Maret", "April",
        "Mei", "Juni", "Juli", "Agustus",
        "September", "Oktober", "November", "Desember"
    ];

    const bulan = value.bulan;
    const tahun = value.tahun || value.year;

    if (bulan !== undefined && tahun !== undefined) {
        const bulanAngka = Number(bulan);
        const namaBulan =
            bulanAngka >= 1 && bulanAngka <= 12
                ? bulanNama[bulanAngka - 1]
                : String(bulan);

        return `${namaBulan} ${tahun}`;
    }

    // Jika periode berisi rentang tanggal.
    const mulai =
        value.tanggalMulai ||
        value.tanggal_mulai ||
        value.startDate ||
        value.start ||
        value.dari;

    const sampai =
        value.tanggalSampai ||
        value.tanggal_sampai ||
        value.endDate ||
        value.end ||
        value.sampai;

    if (mulai && sampai) {
        return `${formatTanggalPeriode_(mulai)} - ${formatTanggalPeriode_(sampai)}`;
    }

    if (mulai) {
        return formatTanggalPeriode_(mulai);
    }

    // Pilihan terakhir: cari properti yang memang berupa teks.
    for (const key of Object.keys(value)) {
        if (
            typeof value[key] === "string" &&
            value[key].trim() &&
            !/token|id/i.test(key)
        ) {
            return value[key].trim();
        }
    }

    return "-";
}

/* Format tanggal untuk label periode. */
function formatTanggalPeriode_(value) {
    if (!value) return "-";

    const text = String(value);

    // Tanggal format YYYY-MM-DD.
    const cocok = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);

    if (cocok) {
        const bulanNama = [
            "Januari", "Februari", "Maret", "April",
            "Mei", "Juni", "Juli", "Agustus",
            "September", "Oktober", "November", "Desember"
        ];

        return `${Number(cocok[3])} ${bulanNama[Number(cocok[2]) - 1]} ${cocok[1]}`;
    }

    return text;
}


/* ============================================================
   TAMPILKAN HASIL REKAP PROFESIONAL
   KHUSUS REKAP — FUNGSI LAIN TIDAK DIUBAH
   ============================================================ */

function tampilkanHasilRekap(result, periode) {
    const box = $("rekapResult");

    if (!box) return;

    result = result || {};


    const orders = Array.isArray(result.orders)
        ? result.orders
        : [];

    /*
     * Hitung ulang statistik dan rekap berdasarkan DETAIL ORDER.
     */
    const normalisasiStatus = (value) => {
        const status = String(value || "OPEN")
            .trim()
            .toUpperCase();

        if (status === "MENUNGGU") return "OPEN";
        if (status === "DALAM PROSES") return "PROSES";

        return status;
    };

    const statistik = {
        total: orders.length,
        open: 0,
        proses: 0,
        selesai: 0,
        ditolak: 0
    };

    const cabangMap = {};
    const sowMap = {};

    orders.forEach((order) => {
        const status = normalisasiStatus(order.status);

        if (status === "OPEN") statistik.open++;
        else if (status === "PROSES") statistik.proses++;
        else if (status === "SELESAI") statistik.selesai++;
        else if (status === "DITOLAK") statistik.ditolak++;

        // Rekap cabang
        let kodeCabang = String(
            order.kode_cabang || ""
        ).trim();

        let namaCabang = String(
            order.nama_cabang || ""
        ).trim();

        const teksCabang = String(
            order.cabang || ""
        ).trim();

        if (!kodeCabang && teksCabang) {
            const bagian = teksCabang.match(
                /^([^-]+)\s*-\s*(.+)$/
            );

            if (bagian) {
                kodeCabang = bagian[1].trim();
                namaCabang = namaCabang || bagian[2].trim();
            } else {
                namaCabang = namaCabang || teksCabang;
            }
        }

        const kunciCabang = (
            kodeCabang || namaCabang || "CABANG_TIDAK_DIKETAHUI"
        ).toUpperCase();

        if (!cabangMap[kunciCabang]) {
            cabangMap[kunciCabang] = {
                kode: kodeCabang,
                nama: namaCabang || kodeCabang || "Cabang Tidak Diketahui",
                total: 0,
                open: 0,
                proses: 0,
                selesai: 0,
                ditolak: 0
            };
        }

        const cabang = cabangMap[kunciCabang];
        cabang.total++;

        if (status === "OPEN") cabang.open++;
        else if (status === "PROSES") cabang.proses++;
        else if (status === "SELESAI") cabang.selesai++;
        else if (status === "DITOLAK") cabang.ditolak++;

        // Rekap SOW
        const namaSOW = String(
            order.sow || order.teknisi || "Belum Ditentukan"
        ).trim() || "Belum Ditentukan";

        const kunciSOW = namaSOW.toUpperCase();

        if (!sowMap[kunciSOW]) {
            sowMap[kunciSOW] = {
                nama: namaSOW,
                total: 0,
                open: 0,
                proses: 0,
                selesai: 0,
                ditolak: 0
            };
        }

        const sow = sowMap[kunciSOW];
        sow.total++;

        if (status === "OPEN") sow.open++;
        else if (status === "PROSES") sow.proses++;
        else if (status === "SELESAI") sow.selesai++;
        else if (status === "DITOLAK") sow.ditolak++;
    });

    const rekapCabang = Object.values(cabangMap)
        .sort((a, b) => b.total - a.total);

    const rekapSOW = Object.values(sowMap)
        .sort((a, b) => b.total - a.total);


    const periodeText = formatPeriodeRekap(
        result.labelPeriode ||
        result.periode ||
        periode ||
        periodeRekapAktif
    );

    const aman = (value) => {
        if (value === null || value === undefined || value === "") {
            return "-";
        }
        return esc(String(value));
    };

    const angka = (value) => {
        const nilai = Number(value);
        return Number.isFinite(nilai) ? nilai : 0;
    };

    const nilaiCabang = (order) => {
        if (order.cabang) return order.cabang;

        const kode = order.kode_cabang || "";
        const nama = order.nama_cabang || "";

        if (kode && nama) return `${kode} - ${nama}`;
        return kode || nama || "-";
    };

    const statusClass = (status) => {
        const value = String(status || "OPEN")
            .toLowerCase()
            .replace(/[^a-z0-9_-]/g, "");

        return `rekap-status-${value}`;
    };

    const kartuStatistik = [
        { label: "TOTAL ORDER", nilai: statistik.total },
        { label: "OPEN", nilai: statistik.open },
        { label: "PROSES", nilai: statistik.proses },
        { label: "SELESAI", nilai: statistik.selesai },
        { label: "DITOLAK", nilai: statistik.ditolak }
    ];

    let html = `
        <div class="rekap-report">

            <header class="rekap-title">
                <h2>LAPORAN DETAIL SOW IV DENPASAR</h2>
                <h3>REKAP LAPORAN SOW</h3>
                <p>Periode: <strong>${aman(periodeText)}</strong></p>
                <p class="rekap-subtitle">
                    Jumlah order dalam laporan: ${orders.length}
                </p>
            </header>

            <section class="rekap-statistik">
                <h3>STATISTIK LAPORAN</h3>
                <div class="rekap-stat-grid">
    `;

    kartuStatistik.forEach((item) => {
        html += `
            <div class="rekap-stat-card">
                <span>${item.label}</span>
                <strong>${angka(item.nilai)}</strong>
            </div>
        `;
    });

    html += `
                </div>
            </section>

            <section class="rekap-section">
                <h3>REKAP BERDASARKAN CABANG</h3>
                <div class="table-wrapper rekap-table-scroll">
                    <table class="rekap-table">
                        <thead>
                            <tr>
                                <th>No</th>
                                <th>Kode Cabang</th>
                                <th>Nama Cabang</th>
                                <th>Total</th>
                                <th>Open</th>
                                <th>Proses</th>
                                <th>Selesai</th>
                                <th>Ditolak</th>
                            </tr>
                        </thead>
                        <tbody>
    `;

    if (rekapCabang.length) {
        rekapCabang.forEach((item, index) => {
            html += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${aman(item.kode_cabang || item.kode)}</td>
                    <td>${aman(item.nama_cabang || item.nama)}</td>
                    <td>${angka(item.total)}</td>
                    <td>${angka(item.open)}</td>
                    <td>${angka(item.proses)}</td>
                    <td>${angka(item.selesai)}</td>
                    <td>${angka(item.ditolak)}</td>
                </tr>
            `;
        });
    } else {
        html += `
            <tr>
                <td colspan="8" class="rekap-empty">
                    Tidak ada data cabang pada periode ini.
                </td>
            </tr>
        `;
    }

    html += `
                        </tbody>
                    </table>
                </div>
            </section>

            <section class="rekap-section">
                <h3>REKAP BERDASARKAN SOW</h3>
                <div class="table-wrapper rekap-table-scroll">
                    <table class="rekap-table">
                        <thead>
                            <tr>
                                <th>No</th>
                                <th>Nama SOW</th>
                                <th>Total</th>
                                <th>Open</th>
                                <th>Proses</th>
                                <th>Selesai</th>
                                <th>Ditolak</th>
                            </tr>
                        </thead>
                        <tbody>
    `;

    if (rekapSOW.length) {
        rekapSOW.forEach((item, index) => {
            html += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${aman(
                item.sow ||
                item.teknisi ||
                item.nama ||
                "Belum Ditugaskan"
            )}</td>
                    <td>${angka(item.total)}</td>
                    <td>${angka(item.open)}</td>
                    <td>${angka(item.proses)}</td>
                    <td>${angka(item.selesai)}</td>
                    <td>${angka(item.ditolak)}</td>
                </tr>
            `;
        });
    } else {
        html += `
            <tr>
                <td colspan="7" class="rekap-empty">
                    Tidak ada data SOW pada periode ini.
                </td>
            </tr>
        `;
    }

    html += `
                        </tbody>
                    </table>
                </div>
            </section>

            <section class="rekap-section">
                <h3>DETAIL ORDER</h3>
                <p class="rekap-table-note">
                    Seluruh detail laporan pada periode terpilih.
                    Kolom Deskripsi disertakan pada setiap order.
                </p>

                <div class="table-wrapper rekap-table-scroll">
                    <table class="rekap-table rekap-detail-table">
                        <thead>
                            <tr>
                                <th>No</th>
                                <th>Kode Order</th>
                                <th>Tanggal</th>
                                <th>Nama</th>
                                <th>Unit Kerja</th>
                                <th>Cabang</th>
                                <th>Jenis Kendala</th>
                                <th>Deskripsi</th>
                                <th>WhatsApp Pelapor</th>
                                <th>Status</th>
                                <th>SOW</th>
                                <th>Catatan Progres</th>
                                <th>Tanggal Update</th>
                            </tr>
                        </thead>
                        <tbody>
    `;

    if (orders.length) {
        orders.forEach((order, index) => {
            const status = String(order.status || "OPEN").toUpperCase();

            let tanggal = order.tanggal || "-";

            if (typeof formatTanggalTampilan === "function") {
                tanggal = formatTanggalTampilan(order.tanggal);
            }

            html += `
                <tr>
                    <td>${index + 1}</td>
                    <td class="rekap-order-code">${aman(order.kode)}</td>
                    <td>${aman(tanggal)}</td>
                    <td>${aman(order.nama)}</td>
                    <td>${aman(order.unit_kerja)}</td>
                    <td>${aman(nilaiCabang(order))}</td>
                    <td>${aman(order.jenis_kendala)}</td>
                    <td class="rekap-description">
                        ${aman(order.deskripsi)}
                    </td>
                    <td>${aman(order.whatsapp)}</td>
                    <td>
                        <span class="rekap-status ${statusClass(status)}">
                            ${aman(status)}
                        </span>
                    </td>
                    <td>${aman(order.sow || order.teknisi)}</td>
                    <td class="rekap-description">
                        ${aman(order.catatan_progres)}
                    </td>
                    <td>${aman(order.tanggal_update)}</td>
                </tr>
            `;
        });
    } else {
        html += `
            <tr>
                <td colspan="13" class="rekap-empty">
                    Tidak ada order pada periode ini.
                </td>
            </tr>
        `;
    }

    html += `
                        </tbody>
                    </table>
                </div>
            </section>

        </div>
    `;

    box.innerHTML = html;
}

/* ============================================================
   EXPORT EXCEL — LAPORAN SOW IV DENPASAR
   Satu sheet:
   1. Informasi periode
   2. Statistik laporan
   3. Rekap cabang
   4. Rekap teknisi / SOW
   5. Detail order lengkap
   ============================================================ */

async function downloadRekapExcel() {
    if (
        !hasilRekapTerakhir ||
        !hasilRekapTerakhir.success
    ) {
        alert("Silakan tampilkan rekap terlebih dahulu.");
        return;
    }

    if (typeof ExcelJS === "undefined") {
        alert("Library ExcelJS belum tersedia. Periksa pemuatan library Excel.");
        return;
    }

    try {
        const result = hasilRekapTerakhir;

        const statistik = result.statistik || {};
        const rekapCabang = Array.isArray(result.rekapCabang)
            ? result.rekapCabang : [];
        const rekapSOW = Array.isArray(result.rekapTeknisi)
            ? result.rekapTeknisi : [];
        const orders = Array.isArray(result.orders)
            ? result.orders : [];

        const workbook = new ExcelJS.Workbook();
        workbook.creator = "SOW IV Denpasar";
        workbook.subject = "Rekap Laporan SOW";
        workbook.created = new Date();

        const ws = workbook.addWorksheet("Laporan SOW", {
            views: [{ state: "frozen", ySplit: 0 }]
        });

        const warna = {
            navy: "17365D",
            biru: "2F75B5",
            bagian: "4472C4",
            header: "5B9BD5",
            putih: "FFFFFF",
            garis: "B7C9D6",
            abu: "F2F2F2",
            open: "FFF2CC",
            proses: "DDEBF7",
            selesai: "E2F0D9",
            ditolak: "F4CCCC"
        };

        const kolomAkhir = 13;

        ws.columns = [
            { width: 7 },   // A No
            { width: 17 },  // B Kode Order / Kode Cabang
            { width: 23 },  // C Nama / Cabang
            { width: 16 },  // D Unit Kerja / Total
            { width: 20 },  // E Tanggal / Open
            { width: 16 },  // F Status / Proses
            { width: 25 },  // G SOW / Selesai
            { width: 22 },  // H Nama Cabang / Ditolak
            { width: 20 },  // I Jenis Kendala
            { width: 42 },  // J Deskripsi
            { width: 20 },  // K WhatsApp
            { width: 42 },  // L Catatan Progres
            { width: 21 }   // M Tanggal Update
        ];

        function gayaBaris(row, options = {}) {
            row.eachCell({ includeEmpty: true }, function (cell) {
                cell.font = {
                    name: "Arial",
                    size: 10,
                    color: {
                        argb: options.fontColor || "222222"
                    },
                    bold: Boolean(options.bold)
                };

                cell.alignment = {
                    vertical: "middle",
                    horizontal: options.align || "left",
                    wrapText: true
                };

                cell.border = {
                    top: { style: "thin", color: { argb: warna.garis } },
                    left: { style: "thin", color: { argb: warna.garis } },
                    bottom: { style: "thin", color: { argb: warna.garis } },
                    right: { style: "thin", color: { argb: warna.garis } }
                };

                if (options.fill) {
                    cell.fill = {
                        type: "pattern",
                        pattern: "solid",
                        fgColor: { argb: options.fill }
                    };
                }
            });

            if (options.height) {
                row.height = options.height;
            }
        }

        function tambahJudul(teks, fill = warna.biru) {
            const row = ws.addRow([teks]);
            ws.mergeCells(row.number, 1, row.number, kolomAkhir);

            row.getCell(1).fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: fill }
            };

            row.getCell(1).font = {
                name: "Arial",
                size: 12,
                bold: true,
                color: { argb: warna.putih }
            };

            row.getCell(1).alignment = {
                horizontal: "center",
                vertical: "middle"
            };

            row.height = 25;
            return row;
        }

        function tambahHeader(nilai) {
            const row = ws.addRow(nilai);
            gayaBaris(row, {
                fill: warna.header,
                fontColor: warna.putih,
                bold: true,
                align: "center",
                height: 30
            });
            return row;
        }

        function angka(nilai) {
            const n = Number(nilai);
            return Number.isFinite(n) ? n : 0;
        }

        function nilaiCabang(order) {
            const kode = order.kode_cabang || "";
            const nama = order.nama_cabang || "";

            if (order.cabang) return order.cabang;
            if (kode && nama) return kode + " - " + nama;

            return kode || nama || "";
        }

        function nilaiSOW(order) {
            return order.sow ||
                order.teknisi ||
                "Belum Ditentukan";
        }

        function statusNormal(nilai) {
            const status = String(nilai || "OPEN")
                .trim()
                .toUpperCase();

            if (status === "MENUNGGU") return "OPEN";
            if (status === "DALAM PROSES") return "PROSES";

            return status;
        }

        // ----------------------------------------------------
        // 1. JUDUL DAN INFORMASI PERIODE
        // ----------------------------------------------------

        const judul = ws.addRow([
            "LAPORAN DETAIL SOW IV DENPASAR"
        ]);

        ws.mergeCells(judul.number, 1, judul.number, kolomAkhir);

        judul.getCell(1).font = {
            name: "Arial",
            size: 16,
            bold: true,
            color: { argb: warna.putih }
        };

        judul.getCell(1).fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: warna.navy }
        };

        judul.getCell(1).alignment = {
            horizontal: "center",
            vertical: "middle"
        };

        judul.height = 34;

        ws.addRow([]);
        tambahJudul("REKAP LAPORAN SOW");

        const periode = String(
            periodeRekapTerakhir || periodeRekapAktif || "-"
        ).toUpperCase();

        [
            ["PERIODE", periode],
            ["TANGGAL MULAI", result.periode?.mulai || "-"],
            ["TANGGAL SAMPAI", result.periode?.sampai || "-"]
        ].forEach(function (item) {
            const row = ws.addRow(item);
            gayaBaris(row);
            row.getCell(1).font = { name: "Arial", size: 10, bold: true };
            row.getCell(2).font = { name: "Arial", size: 10, bold: true };
        });

        ws.addRow([]);

        // ----------------------------------------------------
        // 2. STATISTIK LAPORAN
        // ----------------------------------------------------

        tambahJudul("STATISTIK LAPORAN", warna.bagian);
        tambahHeader(["Keterangan", "Jumlah"]);

        [
            ["Total Order", angka(statistik.total ?? orders.length)],
            ["OPEN", angka(statistik.open)],
            ["PROSES", angka(statistik.proses)],
            ["SELESAI", angka(statistik.selesai)],
            ["DITOLAK", angka(statistik.ditolak)]
        ].forEach(function (item) {
            const row = ws.addRow(item);
            gayaBaris(row);

            const status = String(item[0]).toUpperCase();
            const fill = status === "OPEN" ? warna.open
                : status === "PROSES" ? warna.proses
                    : status === "SELESAI" ? warna.selesai
                        : status === "DITOLAK" ? warna.ditolak
                            : null;

            if (fill) {
                row.getCell(1).fill = {
                    type: "pattern",
                    pattern: "solid",
                    fgColor: { argb: fill }
                };
                row.getCell(2).fill = {
                    type: "pattern",
                    pattern: "solid",
                    fgColor: { argb: fill }
                };
            }
        });

        ws.addRow([]);

        // ----------------------------------------------------
        // 3. REKAP BERDASARKAN CABANG
        // ----------------------------------------------------

        tambahJudul("REKAP BERDASARKAN CABANG", warna.bagian);

        tambahHeader([
            "Kode Cabang",
            "Nama Cabang",
            "Total",
            "Open",
            "Proses",
            "Selesai",
            "Ditolak"
        ]);

        if (rekapCabang.length) {
            rekapCabang.forEach(function (item) {
                const row = ws.addRow([
                    item.kode_cabang || item.kode || "",
                    item.nama_cabang || item.nama || "",
                    angka(item.total ?? item.jumlah),
                    angka(item.open),
                    angka(item.proses),
                    angka(item.selesai),
                    angka(item.ditolak)
                ]);

                gayaBaris(row);
            });
        } else {
            const row = ws.addRow(["Tidak ada data cabang"]);
            ws.mergeCells(row.number, 1, row.number, 7);
            gayaBaris(row);
        }

        ws.addRow([]);

        // ----------------------------------------------------
        // 4. REKAP BERDASARKAN TEKNISI / SOW
        // ----------------------------------------------------

        tambahJudul("REKAP BERDASARKAN TEKNISI / SOW", warna.bagian);

        tambahHeader([
            "Nama Teknisi / SOW",
            "Total",
            "Open",
            "Proses",
            "Selesai",
            "Ditolak"
        ]);

        if (rekapSOW.length) {
            rekapSOW.forEach(function (item) {
                const row = ws.addRow([
                    item.sow || item.teknisi || item.nama || "Belum Ditentukan",
                    angka(item.total ?? item.jumlah),
                    angka(item.open),
                    angka(item.proses),
                    angka(item.selesai),
                    angka(item.ditolak)
                ]);

                gayaBaris(row);
            });
        } else {
            const row = ws.addRow(["Tidak ada data teknisi / SOW"]);
            ws.mergeCells(row.number, 1, row.number, 6);
            gayaBaris(row);
        }

        ws.addRow([]);

        // ----------------------------------------------------
        // 5. DETAIL ORDER LENGKAP
        // ----------------------------------------------------

        tambahJudul("DETAIL ORDER", warna.bagian);

        tambahHeader([
            "No",
            "Kode Order",
            "Tanggal",
            "Nama Pelapor",
            "Unit Kerja",
            "Kode Cabang",
            "Nama Cabang",
            "Jenis Kendala",
            "Deskripsi Kendala",
            "WhatsApp Pelapor",
            "Status",
            "Teknisi / SOW",
            "Catatan Progres"
        ]);

        if (orders.length) {
            orders.forEach(function (order, index) {
                const row = ws.addRow([
                    index + 1,
                    order.kode || "",
                    order.tanggal || "",
                    order.nama || "",
                    order.unit_kerja || "",
                    order.kode_cabang || "",
                    order.nama_cabang || order.cabang || "",
                    order.jenis_kendala || "",
                    order.deskripsi || "",
                    order.whatsapp || "",
                    statusNormal(order.status),
                    nilaiSOW(order),
                    order.catatan_progres || ""
                ]);

                gayaBaris(row, {
                    height: 32
                });

                const status = statusNormal(order.status);
                const fill = status === "OPEN" ? warna.open
                    : status === "PROSES" ? warna.proses
                        : status === "SELESAI" ? warna.selesai
                            : status === "DITOLAK" ? warna.ditolak
                                : null;

                if (fill) {
                    row.getCell(11).fill = {
                        type: "pattern",
                        pattern: "solid",
                        fgColor: { argb: fill }
                    };
                    row.getCell(11).font = {
                        name: "Arial",
                        size: 10,
                        bold: true
                    };
                }
            });
        } else {
            const row = ws.addRow(["Tidak ada order pada periode ini."]);
            ws.mergeCells(row.number, 1, row.number, kolomAkhir);
            gayaBaris(row);
        }

        // Pengaturan cetak dan filter untuk detail order.
        ws.pageSetup.orientation = "landscape";
        ws.pageSetup.fitToPage = true;
        ws.pageSetup.fitToWidth = 1;
        ws.pageSetup.fitToHeight = 0;
        ws.pageSetup.paperSize = 9;
        ws.pageSetup.margins = {
            left: 0.25,
            right: 0.25,
            top: 0.5,
            bottom: 0.5,
            header: 0.2,
            footer: 0.2
        };

        ws.eachRow(function (row) {
            row.eachCell({ includeEmpty: true }, function (cell) {
                cell.alignment = {
                    ...cell.alignment,
                    vertical: "middle",
                    wrapText: true
                };
            });
        });

        const namaFile = "Laporan_SOW_IV_Denpasar_" +
            periode.replace(/[^A-Z0-9_-]/g, "_") +
            ".xlsx";

        await workbook.xlsx.writeBuffer().then(function (buffer) {
            const blob = new Blob(
                [buffer],
                {
                    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                }
            );

            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");

            link.href = url;
            link.download = namaFile;
            document.body.appendChild(link);
            link.click();
            link.remove();

            setTimeout(function () {
                URL.revokeObjectURL(url);
            }, 1000);
        });

    } catch (error) {
        console.error("Gagal ekspor Excel:", error);
        alert(
            "Ekspor Excel gagal. Periksa Console browser dan pastikan library ExcelJS tersedia."
        );
    }
}





/* ============================================================
 * LOAD DAFTAR SOW
 * ============================================================ */

async function loadTeknisiAdmin() {

    const table =
        $("teknisiTableBody");

    if (table) {

        table.innerHTML =
            `
        <tr>
          <td colspan="5">
            Memuat daftar SOW...
          </td>
        </tr>
      `;
    }

    try {

        const result =
            await getJSON(
                {
                    teknisi:
                        "true"
                }
            );

        daftarSOW =
            Array.isArray(
                result.teknisi
            )
                ? result.teknisi
                : [];

        renderTeknisiAdmin();

        updateSelectSOW();

    } catch (error) {

        console.error(
            "LOAD SOW:",
            error
        );

        if (table) {

            table.innerHTML =
                `
          <tr>

            <td colspan="5">

              ❌
              ${esc(
                    error.message
                )}

            </td>

          </tr>
        `;
        }
    }
}


/* ============================================================
 * RENDER DAFTAR SOW
 * ============================================================ */

function renderTeknisiAdmin() {

    const table =
        $("teknisiTableBody");

    if (!table) {
        return;
    }

    if (
        daftarSOW.length === 0
    ) {

        table.innerHTML =
            `
        <tr>

          <td colspan="5">
            Belum ada SOW.
          </td>

        </tr>
      `;

        return;
    }

    table.innerHTML =
        daftarSOW
            .map(
                function (
                    item,
                    index
                ) {

                    const aktif =
                        item.status ===
                        "AKTIF";

                    return `
            <tr>

              <td>
                ${index + 1}
              </td>

              <td>
                <strong>
                  ${esc(
                        item.nama
                    )}
                </strong>
              </td>

              <td>
                ${aktif
                            ? "AKTIF"
                            : "NONAKTIF"
                        }
              </td>

              <td>
                ${esc(
                            item.tanggal_update ||
                            "-"
                        )}
              </td>

              <td>

                <button
                  type="button"
                  onclick="editTeknisiAdmin(${Number(
                            item.id
                        )})"
                >
                  ✏️ Edit
                </button>

                <button
                  type="button"
                  onclick="ubahStatusTeknisiAdmin(${Number(
                            item.id
                        )})"
                >
                  ${aktif
                            ? "⛔ Nonaktifkan"
                            : "✅ Aktifkan"
                        }
                </button>

              </td>

            </tr>
          `;
                }
            )
            .join("");
}


/* ============================================================
 * UPDATE SELECT SOW
 * ============================================================ */

function updateSelectSOW() {

    const select =
        $("updateTeknisi");

    if (!select) {
        return;
    }

    const nilaiLama =
        select.value;

    select.innerHTML =
        `
      <option value="">
        -- Pilih SOW --
      </option>
    `;

    daftarSOW
        .filter(
            function (item) {

                return (
                    item.status ===
                    "AKTIF"
                );
            }
        )
        .forEach(
            function (item) {

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
            }
        );

    if (nilaiLama) {

        select.value =
            nilaiLama;
    }
}


/* ============================================================
 * MODAL TAMBAH SOW
 * ============================================================ */

function bukaTambahTeknisi() {

    $("teknisiModalTitle").textContent =
        "Tambah SOW";

    $("teknisiNamaInput").value =
        "";

    $("teknisiIdInput").value =
        "";

    $("teknisiModal")?.classList.add(
        "show"
    );

    $("teknisiNamaInput")?.focus();
}


/* ============================================================
 * EDIT SOW
 * ============================================================ */

function editTeknisiAdmin(
    id
) {

    const item =
        daftarSOW.find(
            function (data) {

                return (
                    Number(
                        data.id
                    ) ===
                    Number(id)
                );
            }
        );

    if (!item) {

        alert(
            "Data SOW tidak ditemukan."
        );

        return;
    }

    $("teknisiModalTitle").textContent =
        "Edit SOW";

    $("teknisiNamaInput").value =
        item.nama ||
        "";

    $("teknisiIdInput").value =
        item.id;

    $("teknisiModal")?.classList.add(
        "show"
    );

    $("teknisiNamaInput")?.focus();
}


/* ============================================================
 * TUTUP MODAL SOW
 * ============================================================ */

function tutupTeknisiModal() {

    $("teknisiModal")?.classList.remove(
        "show"
    );
}


/* ============================================================
 * SIMPAN SOW
 * ============================================================ */

async function simpanTeknisiAdmin() {

    const nama =
        val(
            "teknisiNamaInput"
        );

    const id =
        val(
            "teknisiIdInput"
        );

    const button =
        $("simpanTeknisiButton");

    if (!nama) {

        alert(
            "Nama SOW wajib diisi."
        );

        return;
    }

    button.disabled =
        true;

    try {

        const result =
            await postJSON(
                {
                    action:
                        id
                            ? "editTeknisi"
                            : "tambahTeknisi",

                    token:
                        ADMIN_TOKEN,

                    id:
                        id
                            ? Number(id)
                            : undefined,

                    nama:
                        nama
                }
            );

        if (
            !result.success
        ) {

            throw new Error(
                result.message ||
                "Gagal menyimpan SOW."
            );
        }

        alert(
            result.message ||
            "SOW berhasil disimpan."
        );

        tutupTeknisiModal();

        await loadTeknisiAdmin();

    } catch (error) {

        console.error(
            "SIMPAN SOW:",
            error
        );

        alert(
            "❌ " +
            error.message
        );

    } finally {

        button.disabled =
            false;
    }
}


/* ============================================================
 * AKTIF / NONAKTIF SOW
 * ============================================================ */

async function ubahStatusTeknisiAdmin(
    id
) {

    const item =
        daftarSOW.find(
            function (data) {

                return (
                    Number(
                        data.id
                    ) ===
                    Number(id)
                );
            }
        );

    if (!item) {
        return;
    }

    const statusBaru =
        item.status ===
            "AKTIF"
            ? "NONAKTIF"
            : "AKTIF";

    const konfirmasi =
        confirm(
            `Ubah status SOW "${item.nama}" menjadi ${statusBaru}?`
        );

    if (!konfirmasi) {
        return;
    }

    try {

        const result =
            await postJSON(
                {
                    action:
                        "ubahStatusTeknisi",

                    token:
                        ADMIN_TOKEN,

                    id:
                        Number(id)
                }
            );

        if (
            !result.success
        ) {

            throw new Error(
                result.message ||
                "Gagal mengubah status."
            );
        }

        alert(
            result.message ||
            "Status SOW berhasil diubah."
        );

        await loadTeknisiAdmin();

    } catch (error) {

        console.error(
            "STATUS SOW:",
            error
        );

        alert(
            "❌ " +
            error.message
        );
    }
}


/* ============================================================
 * NAVIGASI SIDEBAR
 * ============================================================ */

function setupNavigation() {

    const sidebar =
        $("adminSidebar");

    const overlay =
        $("sidebarOverlay");


    function tutupSidebar() {

        sidebar?.classList.remove(
            "open"
        );

        overlay?.classList.remove(
            "show"
        );
    }


    function resetMode() {

        document.body.classList.remove(
            "mode-dashboard",
            "mode-rekap",
            "mode-teknisi"
        );
    }


    function bukaMode(
        target
    ) {

        resetMode();

        document.body.classList.add(
            "mode-" +
            target
        );

        document
            .querySelectorAll(
                ".sidebar-menu-item"
            )
            .forEach(
                function (item) {

                    item.classList.toggle(
                        "active",

                        item.dataset
                            .menuTarget ===
                        target
                    );
                }
            );

        tutupSidebar();
    }


    $("sidebarMenuButton")
        ?.addEventListener(
            "click",
            function () {

                sidebar?.classList.add(
                    "open"
                );

                overlay?.classList.add(
                    "show"
                );
            }
        );


    $("sidebarCloseButton")
        ?.addEventListener(
            "click",
            tutupSidebar
        );


    overlay?.addEventListener(
        "click",
        tutupSidebar
    );


    document
        .querySelectorAll(
            ".sidebar-menu-item"
        )
        .forEach(
            function (item) {

                item.addEventListener(
                    "click",
                    function () {

                        bukaMode(
                            item.dataset
                                .menuTarget
                        );
                    }
                );
            }
        );


    bukaMode(
        "dashboard"
    );
}


/* ============================================================
 * EVENT UTAMA ADMIN
 * ============================================================ */

function setupEvents() {

    [
        "mousemove",
        "keydown",
        "click",
        "scroll",
        "touchstart"
    ]
        .forEach(
            function (eventName) {

                document.addEventListener(
                    eventName,
                    resetIdleTimer,
                    {
                        passive:
                            true
                    }
                );
            }
        );


    $("logoutButton")
        ?.addEventListener(
            "click",
            function () {

                logoutAdmin(
                    "Logout admin"
                );
            }
        );


    $("searchButton")
        ?.addEventListener(
            "click",
            loadOrders
        );


    $("searchOrder")
        ?.addEventListener(
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


    [
        "filterCabang",
        "filterTanggalMulai",
        "filterTanggalSampai"
    ]
        .forEach(
            function (id) {

                $(id)?.addEventListener(
                    "change",
                    loadOrders
                );
            }
        );


    $("resetFilter")
        ?.addEventListener(
            "click",
            function () {

                $("searchOrder").value =
                    "";

                $("filterCabang").value =
                    "";

                $("filterTanggalMulai").value =
                    "";

                $("filterTanggalSampai").value =
                    "";

                loadOrders();
            }
        );


    $("closeModal")
        ?.addEventListener(
            "click",
            tutupModal
        );


    $("closeModalButton")
        ?.addEventListener(
            "click",
            tutupModal
        );


    $("detailModal")
        ?.addEventListener(
            "click",
            function (event) {

                if (
                    event.target ===
                    $("detailModal")
                ) {

                    tutupModal();
                }
            }
        );


    $("saveUpdateButton")
        ?.addEventListener(
            "click",
            simpanUpdateOrder
        );


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
                            button.dataset
                                .period
                        );
                    }
                );
            }
        );


    $("tampilkanRekapButton")
        ?.addEventListener(
            "click",
            ambilRekap
        );


    $("downloadRekapExcelButton")
        ?.addEventListener(
            "click",
            downloadRekapExcel
        );


    $("tambahTeknisiButton")
        ?.addEventListener(
            "click",
            bukaTambahTeknisi
        );


    $("simpanTeknisiButton")
        ?.addEventListener(
            "click",
            simpanTeknisiAdmin
        );


    $("batalTeknisiButton")
        ?.addEventListener(
            "click",
            tutupTeknisiModal
        );


    $("closeTeknisiModal")
        ?.addEventListener(
            "click",
            tutupTeknisiModal
        );


    $("teknisiModal")
        ?.addEventListener(
            "click",
            function (event) {

                if (
                    event.target ===
                    $("teknisiModal")
                ) {

                    tutupTeknisiModal();
                }
            }
        );


    document.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key ===
                "Escape"
            ) {

                tutupModal();

                tutupTeknisiModal();
            }
        }
    );
}


/* ============================================================
 * INIT ADMIN
 * ============================================================ */

async function initAdmin() {

    setupEvents();

    setupNavigation();

    resetIdleTimer();

    tampilkanFormPeriode(
        "harian"
    );

    await Promise.all(
        [
            loadCabangMasterData(),
            loadOrders(),
            loadTeknisiAdmin()
        ]
    );

    setInterval(
        function () {

            if (
                Date.now() -
                lastActivity <
                ADMIN_IDLE_MS / 2
            ) {

                touchSession();
            }

        },
        4 * 60 * 1000
    );
}


/* ============================================================
 * START
 * ============================================================ */

document.addEventListener(
    "DOMContentLoaded",
    initAdmin
);
