import dayjs from 'dayjs'
import moment from "moment";
export const tanggal = {
  data() {
    return {
      tgl: '',
      bulan: [
        '',
        'Januari',
        'Februari',
        'Maret',
        'April',
        'Mei',
        'Juni',
        'Juli',
        'Agustus',
        'September',
        'Oktober',
        'November',
        'Desember',
      ],
    }
  },
  methods: {


    minimal_date_format_no_timezone: function (date) {
      if (!date) {
        return "-";
      }

      var b = moment.utc(date).utcOffset("Asia/Jakarta");

      if (!b.isValid()) {
        return "-";
      }

      return b.format("DD/MM/YY HH:mm");
    },
    minimal_date_format_no_timezone_minute_detik: function (date) {
      if (!date) {
        return "-";
      }

      var b = moment.utc(date).utcOffset("Asia/Jakarta");

      if (!b.isValid()) {
        return "-";
      }

      return b.format("DD/MM/YYYY HH:mm:ss");
    },

    minimal_time_format_no_timezone: function (date) {
      var b = moment.parseZone(date);
      return b.format("HH:mm");
    },

    momentDateFormat: function (date, type) {
      if (!date) {
        return "";
      }
      var d = moment.parseZone(date);
      return d.format(type);
    },
    generate_tanggal_indonesia_v1: function (date) {
      let tanggal_lengkap = date
      let tanggal = tanggal_lengkap.split('-')[2]
      let bulan = tanggal_lengkap.split('-')[1]
      let tahun = tanggal_lengkap.split('-')[0]
      return tanggal + ' ' + this.bulan[Math.abs(bulan)] + ' ' + tahun
    },
    timestamp_to_tanggal_indonesia: function (date) {
      let tanggal_lengkap = date ? dayjs(date).format('YYYY-MM-DD') : '-'
      let tgl = tanggal_lengkap.split('-')[2]
      let bulan = tanggal_lengkap.split('-')[1]
      let tahun = tanggal_lengkap.split('-')[0]
      return tgl + ' ' + this.bulan[Math.abs(bulan)] + ' ' + tahun
    },
    convert_waktu_indonesia: function (dateStr) {
      const waktu = new Date(dateStr)
      const Day = waktu.getDay()
      const date = waktu.getDate()
      const FullYear = waktu.getFullYear()
      let Hours = waktu.getHours()
      Hours = ('0' + Hours).slice(-2)
      const Milliseconds = waktu.getMilliseconds()
      let Minutes = waktu.getMinutes()
      Minutes = ('0' + Minutes).slice(-2)
      const Month = waktu.getMonth() + 1
      const Seconds = waktu.getSeconds()
      return (
        date +
        ' ' +
        this.bulan[Math.abs(Month)] +
        ' ' +
        FullYear +
        ' - ' +
        Hours +
        ':' +
        Minutes
      )
    },
    formatDate: function (date, type) {
      var b = moment.parseZone(date);
      return b.format(type)
    },
    customBackEndDateFormat: function (date, type) {
      return dayjs(date).format(type)
    },
    date_plus_hari: function (date, jumlah) {
      let tanggal = date ? dayjs(date).format('YYYY-MM-DD') : '-'

      let newdate = new Date(tanggal)

      newdate.setDate(newdate.getDate() + jumlah)

      let dd = newdate.getDate()
      let mm = newdate.getMonth() + 1
      let y = newdate.getFullYear()

      return y + '-' + this.boundNum(mm) + '-' + this.boundNum(dd)
    },
    now: function () {
      const today = new Date()
      const date =
        today.getFullYear() +
        '-' +
        this.boundNum(today.getMonth() + 1) +
        '-' +
        this.boundNum(today.getDate())
      const time =
        this.boundNum(today.getHours()) +
        ':' +
        this.boundNum(today.getMinutes()) +
        ':' +
        this.boundNum(today.getSeconds())
      const dateTime = date + ' ' + time
      return dateTime
    },
    boundNum: function (val) {
      return val < 10 ? '0' + val : val
    },
    backEndDateFormat: function (date) {
      return dayjs(date).format('YYYY-MM-DD')
    },
    frontEndDateFormat: function (date) {
      return dayjs(date).format('DD-MM-YYYY')
    },
    filterTime: function (value) {
      return value.substring(0, 5)
    },
    backEndDateTimeFormat: function (date) {
      return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
    },
    backEndTimeFormat: function (date) {
      return dayjs(date).format('HH:mm')
    },
    minimal_date_format_no_timezone: function (date) {
      var b = moment.parseZone(date);
      return b.format('DD/MM/YY HH:mm')
    },
    minimal_time_format_no_timezone: function (date) {
      var b = moment.parseZone(date);
      return b.format('HH:mm')
    },
    dateTanggal: function (date) {
      var b = moment.parseZone(date);
      return b.format('YYYY-MM-DD')
    },

    dateTanggal1: function (date) {
      var b = moment.parseZone(date);
      return b.format('DD/MM/YYYY')
    },

    minimal_date_format: function (date) {
      return dayjs(date).format('DD/MM/YY HH:mm')
    },
    generate_bulantahun_indonesia_v1: function (date) {
      let tanggal_lengkap = date
      let tanggal = tanggal_lengkap.split('-')[2]
      let bulan = tanggal_lengkap.split('-')[1]
      let tahun = tanggal_lengkap.split('-')[0]
      return this.bulan[Math.abs(bulan)] + ' ' + tahun
    },
    getDays: function (year, month) {
        return new Date(year, month, 0).getDate();
    },
    getMonth: function (bulan) {
      return this.bulan[Math.abs(bulan)]
    },
    month_to_romawai: function (value) {
      if (!value) return ''
      value = value.toString()
      switch (value) {
        case '01':
          value = 'I'
          break
        case '02':
          value = 'II'
          break
        case '03':
          value = 'III'
          break
        case '04':
          value = 'IV'
          break
        case '05':
          value = 'V'
          break
        case '06':
          value = 'VI'
          break
        case '07':
          value = 'VII'
          break
        case '08':
          value = 'VIII'
          break
        case '09':
          value = 'IX'
          break
        case '10':
          value = 'X'
          break
        case '11':
          value = 'XI'
          break
        case '12':
          value = 'XII'
          break
        default:
          value = '-'
          break
      }
      return value
    },
  },
}