import { useAPIs } from "../composables/useAPIs";

const dashboardService = () => {
  const url = "/dashboard";
  
  async function getStatistik(tahun: number) {
    return useAPIs(`${url}/statistik`, {
      method: "GET",
      // Parameter 'tahun' akan otomatis diubah menjadi query string URL (?tahun=2025)
      params: { tahun }, 
    });
  }

  return {
    getStatistik,
  };
};

export default dashboardService;