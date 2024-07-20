import { ref, onMounted, onUnmounted } from "vue";

export const useWindowScroll = () => {
  const currentScrollPos = ref();
  const prevScrollpos = ref(window.scrollY);
  const isScroll = ref();

  const update = () => {
    currentScrollPos.value = window.scrollY;
    
    if (prevScrollpos.value > currentScrollPos.value) {
      isScroll.value = false;
    } else {
      isScroll.value = true;
    }
    prevScrollpos.value = currentScrollPos.value;
  };

  onMounted(() => window.addEventListener("scroll", update));
  onUnmounted(() => window.removeEventListener("scroll", update));

  return { isScroll, currentScrollPos, prevScrollpos };
};
