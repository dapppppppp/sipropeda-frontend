import { useAPIs } from "../composables/useAPIs";

const usulanProyekService = () => {
  const url = "/usulan-proyek";
  
  async function retrieve(req?: any) {
    return useAPIs(url, {
      method: "GET",
      params: req,
    });
  }

  // 👇 Fungsi baru ditambahkan di sini
  async function retrieveAllData() {
    return useAPIs(`${url}/all`, {
      method: "GET",
    });
  }

  async function getAvailableYears() {
    return useAPIs(`${url}/tahun-anggaran`, {
      method: "GET",
    });
  }

  async function retrieveById(id: any) {
    return useAPIs(`${url}/${id}`, {
      method: "GET",
    });
  }

  async function save(req: any) {
    if (req.id) {
      return update(req);
    } else {
      return create(req);
    }
  }

  async function create(req: any) {
    return useAPIs(url, {
      method: "POST",
      body: req,
    });
  }

  async function update(req: any) {
    return useAPIs(`${url}/${req.id}`, {
      method: "PUT",
      body: req,
    });
  }

  async function destroy(id: any) {
    return useAPIs(`${url}/${id}`, {
      method: "DELETE",
    });
  }

  async function importExcel(formData: FormData) {
    return useAPIs(`${url}/import`, {
      method: "POST",
      body: formData,
    });
  }
  
  async function bulkUpdateStatus(req: any) {
    return useAPIs(`${url}/bulk-update-status`, {
      method: "PUT",
      body: req,
    });
  }

  return {
    retrieve,
    retrieveAllData,
    retrieveById,
    save,
    create,
    update,
    bulkUpdateStatus,
    destroy,
    importExcel,
    getAvailableYears,
  };
};

export default usulanProyekService;