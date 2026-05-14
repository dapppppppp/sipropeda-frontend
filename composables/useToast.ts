import Swal from "sweetalert2";

export function useToast(icon: any, title: any) {
  let Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
  });
  Toast.fire({
    icon: icon,
    title: title,
  });
}
