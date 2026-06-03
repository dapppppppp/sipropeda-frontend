import { useAPIs } from "../composables/useAPIs";

const appConfigService = () => {
  const url = "/app-config";

  async function retrievePublicById(id: any) {
    return useAPIs(`${url}/public/${id}`, {
      method: "GET",
    });
  }

  async function retrieveById(id: any) {
    return useAPIs(`${url}/${id}`, {
      method: "GET",
    });
  }

  async function update(req: any) {
    return useAPIs(`${url}/${req.id}`, {
      method: "PUT",
      body: req,
    });
  }

  async function uploadFile(req: FormData) {
    return useAPIs(`${url}/upload`, {
      method: "POST",
      body: req,
    });
  }

  return {
    retrievePublicById,
    retrieveById,
    update,
    uploadFile,
  };
};

export default appConfigService;