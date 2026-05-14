import { useAPIs } from "../composables/useAPIs";

const penilaianUsulanService = () => {
  const url = "/penilaian-usulan";
  
  async function getByUsulanId(usulanId: any) {
    return useAPIs(`${url}/${usulanId}`, {
      method: "GET",
    });
  }

  async function saveBulk(req: any) {
    return useAPIs(url, {
      method: "POST",
      body: req,
    });
  }

  return {
    getByUsulanId,
    saveBulk,
  };
};

export default penilaianUsulanService;