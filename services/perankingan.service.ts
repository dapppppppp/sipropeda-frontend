import { useAPIs } from "../composables/useAPIs";

const perankinganService = () => {
  const url = "/perankingan";
  
  async function hitungTopsis(req: any) {
    return useAPIs(`${url}/hitung`, {
      method: "POST",
      body: req,
    });
  }

  async function getArsip(req?: any) {
    return useAPIs(`${url}/arsip`, {
      method: "GET",
      params: req, // Berisi parameter 'tahun' dan 'tahap' (misal: RKP)
    });
  }

  return {
    hitungTopsis,
    getArsip,
  };
};

export default perankinganService;