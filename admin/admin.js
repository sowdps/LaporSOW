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
 * TAMPILKAN HASIL REKAP PROFESIONAL
 * ============================================================ */

function tampilkanHasilRekap(
    result,
    periode
) {

    const box =
        $("rekapResult");

    if (!box) {
        return;
    }

    const statistik =
        result.statistik ||
        {};

    const rekapCabang =
        result.rekapCabang ||
        [];

    const rekapSOW =
        result.rekapTeknisi ||
        [];

    const orders =
        result.orders ||
        [];

    const periodeText =
        result.periode ||
        result.labelPeriode ||
        periode;


    box.innerHTML =
        `
      <div class="rekap-report">

        <!-- =========================================
             JUDUL LAPORAN
        ========================================== -->

        <div class="rekap-title">

          <h2>
            LAPORAN DETAIL SOW IV DENPASAR
          </h2>

          <h3>
            REKAP LAPORAN SOW
          </h3>

          <p>
            Periode:
            ${esc(
            periodeText
        )}
          </p>

        </div>


        <!-- =========================================
             STATISTIK
        ========================================== -->

        <div class="rekap-statistik">

          <h3>
            STATISTIK LAPORAN
          </h3>

          <div
            class="rekap-stat-grid"
          >

            <div>
              Total Order

              <strong>
                ${Number(
            statistik.total ||
            0
        )}
              </strong>
            </div>

            <div>
              OPEN

              <strong>
                ${Number(
            statistik.open ||
            0
        )}
              </strong>
            </div>

            <div>
              PROSES

              <strong>
                ${Number(
            statistik.proses ||
            0
        )}
              </strong>
            </div>

            <div>
              SELESAI

              <strong>
                ${Number(
            statistik.selesai ||
            0
        )}
              </strong>
            </div>

            <div>
              DITOLAK

              <strong>
                ${Number(
            statistik.ditolak ||
            0
        )}
              </strong>
            </div>

          </div>

        </div>


        <!-- =========================================
             REKAP CABANG
        ========================================== -->

        <div class="rekap-section">

          <h3>
            REKAP BERDASARKAN CABANG
          </h3>

          <div
            class="table-wrapper"
          >

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
                    Total
                  </th>

                  <th>
                    Open
                  </th>

                  <th>
                    Proses
                  </th>

                  <th>
                    Selesai
                  </th>

                  <th>
                    Ditolak
                  </th>

                </tr>

              </thead>

              <tbody>

                ${rekapCabang.length
            ? rekapCabang
                .map(
                    function (
                        item,
                        index
                    ) {

                        return `
                              <tr>

                                <td>
                                  ${index +
                            1
                            }
                                </td>

                                <td>
                                  ${esc(
                                item.kode_cabang ||
                                item.kode ||
                                item.cabang
                            )}
                                </td>

                                <td>
                                  ${esc(
                                item.nama_cabang ||
                                item.nama ||
                                item.cabang
                            )}
                                </td>

                                <td>
                                  ${Number(
                                item.total ||
                                0
                            )}
                                </td>

                                <td>
                                  ${Number(
                                item.open ||
                                0
                            )}
                                </td>

                                <td>
                                  ${Number(
                                item.proses ||
                                0
                            )}
                                </td>

                                <td>
                                  ${Number(
                                item.selesai ||
                                0
                            )}
                                </td>

                                <td>
                                  ${Number(
                                item.ditolak ||
                                0
                            )}
                                </td>

                              </tr>
                            `;
                    }
                )
                .join("")
            :
            `
                        <tr>
                          <td colspan="8">
                            Tidak ada data.
                          </td>
                        </tr>
                      `
        }

              </tbody>

            </table>

          </div>

        </div>


        <!-- =========================================
             REKAP SOW
        ========================================== -->

        <div class="rekap-section">

          <h3>
            REKAP BERDASARKAN SOW
          </h3>

          <div
            class="table-wrapper"
          >

            <table>

              <thead>

                <tr>

                  <th>No</th>

                  <th>
                    SOW
                  </th>

                  <th>
                    Total
                  </th>

                  <th>
                    Open
                  </th>

                  <th>
                    Proses
                  </th>

                  <th>
                    Selesai
                  </th>

                  <th>
                    Ditolak
                  </th>

                </tr>

              </thead>

              <tbody>

                ${rekapSOW.length
            ? rekapSOW
                .map(
                    function (
                        item,
                        index
                    ) {

                        return `
                              <tr>

                                <td>
                                  ${index +
                            1
                            }
                                </td>

                                <td>
                                  ${esc(
                                item.sow ||
                                item.teknisi ||
                                item.nama ||
                                "Belum Ditugaskan"
                            )}
                                </td>

                                <td>
                                  ${Number(
                                item.total ||
                                0
                            )}
                                </td>

                                <td>
                                  ${Number(
                                item.open ||
                                0
                            )}
                                </td>

                                <td>
                                  ${Number(
                                item.proses ||
                                0
                            )}
                                </td>

                                <td>
                                  ${Number(
                                item.selesai ||
                                0
                            )}
                                </td>

                                <td>
                                  ${Number(
                                item.ditolak ||
                                0
                            )}
                                </td>

                              </tr>
                            `;
                    }
                )
                .join("")
            :
            `
                        <tr>
                          <td colspan="7">
                            Tidak ada data.
                          </td>
                        </tr>
                      `
        }

              </tbody>

            </table>

          </div>

        </div>


        <!-- =========================================
             DETAIL ORDER
        ========================================== -->

        <div class="rekap-section">

          <h3>
            DETAIL ORDER
          </h3>

          <div
            class="table-wrapper"
          >

            <table>

              <thead>

                <tr>

                  <th>No</th>

                  <th>
                    Kode Order
                  </th>

                  <th>
                    Nama
                  </th>

                  <th>
                    Unit Kerja
                  </th>

                  <th>
                    Kode Cabang
                  </th>

                  <th>
                    Jenis Kendala
                  </th>

                  <th>
                    Tanggal
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    SOW
                  </th>

                </tr>

              </thead>

              <tbody>

                ${orders.length
            ? orders
                .map(
                    function (
                        order,
                        index
                    ) {

                        return `
                              <tr>

                                <td>
                                  ${index +
                            1
                            }
                                </td>

                                <td>
                                  ${esc(
                                order.kode
                            )}
                                </td>

                                <td>
                                  ${esc(
                                order.nama
                            )}
                                </td>

                                <td>
                                  ${esc(
                                order.unit_kerja
                            )}
                                </td>

                                <td>
                                  ${esc(
                                order.kode_cabang
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
                                  ${esc(
                                order.status
                            )}
                                </td>

                                <td>
                                  ${esc(
                                order.sow ||
                                order.teknisi ||
                                "-"
                            )}
                                </td>

                              </tr>
                            `;
                    }
                )
                .join("")
            :
            `
                        <tr>
                          <td colspan="9">
                            Tidak ada order pada periode ini.
                          </td>
                        </tr>
                      `
        }

              </tbody>

            </table>

          </div>

        </div>

      </div>
    `;
}


/* ============================================================
 * EXPORT REKAP KE EXCEL
 * ============================================================ */

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

        const statistik =
            result.statistik ||
            {};

        const workbook =
            new ExcelJS.Workbook();

        const sheet =
            workbook.addWorksheet(
                "Rekap SOW"
            );


        /* =============================================
           JUDUL
        ============================================= */

        sheet.addRow(
            [
                "LAPORAN DETAIL SOW IV DENPASAR"
            ]
        );

        sheet.addRow(
            [
                "REKAP LAPORAN SOW"
            ]
        );

        sheet.addRow(
            [
                "Periode: " +
                (
                    result.periode ||
                    result.labelPeriode ||
                    periodeRekapAktif
                )
            ]
        );

        sheet.addRow([]);


        /* =============================================
           STATISTIK
        ============================================= */

        sheet.addRow(
            [
                "STATISTIK LAPORAN"
            ]
        );

        sheet.addRow(
            [
                "Total Order",
                "OPEN",
                "PROSES",
                "SELESAI",
                "DITOLAK"
            ]
        );

        sheet.addRow(
            [
                statistik.total ||
                0,

                statistik.open ||
                0,

                statistik.proses ||
                0,

                statistik.selesai ||
                0,

                statistik.ditolak ||
                0
            ]
        );

        sheet.addRow([]);


        /* =============================================
           REKAP CABANG
        ============================================= */

        sheet.addRow(
            [
                "REKAP BERDASARKAN CABANG"
            ]
        );

        sheet.addRow(
            [
                "No",
                "Kode Cabang",
                "Nama Cabang",
                "Total",
                "Open",
                "Proses",
                "Selesai",
                "Ditolak"
            ]
        );

        (
            result.rekapCabang ||
            []
        ).forEach(
            function (
                item,
                index
            ) {

                sheet.addRow(
                    [
                        index + 1,

                        item.kode_cabang ||
                        item.kode ||
                        item.cabang ||
                        "",

                        item.nama_cabang ||
                        item.nama ||
                        item.cabang ||
                        "",

                        item.total ||
                        0,

                        item.open ||
                        0,

                        item.proses ||
                        0,

                        item.selesai ||
                        0,

                        item.ditolak ||
                        0
                    ]
                );
            }
        );

        sheet.addRow([]);


        /* =============================================
           REKAP SOW
        ============================================= */

        sheet.addRow(
            [
                "REKAP BERDASARKAN SOW"
            ]
        );

        sheet.addRow(
            [
                "No",
                "SOW",
                "Total",
                "Open",
                "Proses",
                "Selesai",
                "Ditolak"
            ]
        );

        (
            result.rekapTeknisi ||
            []
        ).forEach(
            function (
                item,
                index
            ) {

                sheet.addRow(
                    [
                        index + 1,

                        item.sow ||
                        item.teknisi ||
                        item.nama ||
                        "Belum Ditugaskan",

                        item.total ||
                        0,

                        item.open ||
                        0,

                        item.proses ||
                        0,

                        item.selesai ||
                        0,

                        item.ditolak ||
                        0
                    ]
                );
            }
        );

        sheet.addRow([]);


        /* =============================================
           DETAIL ORDER
        ============================================= */

        sheet.addRow(
            [
                "DETAIL ORDER"
            ]
        );

        sheet.addRow(
            [
                "No",
                "Kode Order",
                "Nama",
                "Unit Kerja",
                "Kode Cabang",
                "Jenis Kendala",
                "Tanggal",
                "Status",
                "SOW"
            ]
        );

        (
            result.orders ||
            []
        ).forEach(
            function (
                order,
                index
            ) {

                sheet.addRow(
                    [
                        index + 1,

                        order.kode ||
                        "",

                        order.nama ||
                        "",

                        order.unit_kerja ||
                        "",

                        order.kode_cabang ||
                        "",

                        order.jenis_kendala ||
                        "",

                        order.tanggal ||
                        "",

                        order.status ||
                        "",

                        order.sow ||
                        order.teknisi ||
                        ""
                    ]
                );
            }
        );


        /* =============================================
           AUTO WIDTH
        ============================================= */

        sheet.columns.forEach(
            function (column) {

                let maxLength =
                    12;

                column.eachCell(
                    {
                        includeEmpty:
                            true
                    },

                    function (
                        cell
                    ) {

                        maxLength =
                            Math.min(
                                45,

                                Math.max(
                                    maxLength,

                                    String(
                                        cell.value ??
                                        ""
                                    ).length +
                                    2
                                )
                            );
                    }
                );

                column.width =
                    maxLength;
            }
        );


        /* =============================================
           BOLD HEADER
        ============================================= */

        sheet.eachRow(
            function (
                row
            ) {

                const text =
                    String(
                        row.getCell(
                            1
                        ).value ||
                        ""
                    );

                if (
                    text.includes(
                        "LAPORAN"
                    ) ||
                    text.includes(
                        "STATISTIK"
                    ) ||
                    text.includes(
                        "REKAP BERDASARKAN"
                    ) ||
                    text.includes(
                        "DETAIL ORDER"
                    )
                ) {

                    row.font =
                    {
                        bold:
                            true
                    };
                }
            }
        );


        /* =============================================
           DOWNLOAD
        ============================================= */

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

        const link =
            document.createElement(
                "a"
            );

        link.href =
            url;

        link.download =
            "Laporan_SOW_IV_Denpasar_" +
            periodeRekapAktif +
            "_" +
            new Date()
                .toISOString()
                .slice(
                    0,
                    10
                ) +
            ".xlsx";

        document.body.appendChild(
            link
        );

        link.click();

        document.body.removeChild(
            link
        );

        setTimeout(
            function () {

                URL.revokeObjectURL(
                    url
                );

            },
            1000
        );

    } catch (error) {

        console.error(
            "EXPORT EXCEL:",
            error
        );

        alert(
            "Gagal membuat Excel: " +
            error.message
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
