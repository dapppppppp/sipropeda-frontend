export const OPEN='OPEN';
export const CLOSE='CLOSE';
export const DITERUSKAN='DITERUSKAN';
export const PROSES='PROSES';
export const BATAL='BATAL';
export const TERKIRIM='TERKIRIM';
export const SELESAI='SELESAI';
export const ESKALASI='ESKALASI';
export const PENDING='PENDING';

export const statusKomplain  : any = {
  OPEN: {
    id: "OPEN",
    name: "OPEN",
    color: "#65a30d",
  },
  PROSES: {
    id: "PROSES",
    name: "PROSES",
    color: "primary",
  },
  DITERUSKAN: {
    id: "DITERUSKAN",
    name: "DITERUSKAN",
    color: "indigo",
  },
  ESKALASI: {
    id: "ESKALASI",
    name: "ESKALASI",
    color: "warning",
  },
  SELESAI: {
    id: "SELESAI",
    name: "SELESAI DITANGGAPI",
    color: "info",
  },
  CLOSE: {
    id: "CLOSE",
    name: "CLOSE",
    color: "error",
  },
};