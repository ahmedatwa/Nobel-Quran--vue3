import { ref, onMounted, onUnmounted } from "vue";

export const useWindowScroll = () => {
  let prevScrollpos = window.scrollY;

  const currentScrollPos = ref(0);
  const isScrollingUp = ref<boolean>(false);

  const scrollDirection = ref("");

  const update = (_event: any) => {
    currentScrollPos.value = window.scrollY;
    //scrollTop.value = wi
    if (currentScrollPos.value > 0 && prevScrollpos <= currentScrollPos.value) {
      scrollDirection.value = "d";
      prevScrollpos = currentScrollPos.value;
      isScrollingUp.value = false
    } else {
      prevScrollpos = currentScrollPos.value;
      scrollDirection.value = "u";
      isScrollingUp.value = true
    }
    
  };

  onMounted(() => window.addEventListener("scroll", update));
  onUnmounted(() => window.removeEventListener("scroll", update));

  return { scrollDirection, isScrollingUp, currentScrollPos, prevScrollpos };
};
