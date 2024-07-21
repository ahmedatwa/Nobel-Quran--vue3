import { ref, onMounted, onUnmounted } from "vue";


export const useWindowScroll = (_threshold: number = 300) => {
  let prevScrollpos = window.scrollY;

  const currentScrollPos = ref(0);
  const isScrollingUp = ref<boolean>(false)
  
  const scrollDirection = ref("");

  const update = (_event: any) => {    
    currentScrollPos.value = window.scrollY;
    //scrollTop.value = wi
    if (prevScrollpos < currentScrollPos.value) {
      scrollDirection.value = "d";
      //prevScrollpos = currentScrollPos.value;
      isScrollingUp.value = prevScrollpos < currentScrollPos.value
    } else {
      scrollDirection.value = "u";
      isScrollingUp.value = prevScrollpos < currentScrollPos.value
    }
    prevScrollpos = currentScrollPos.value;
  };

  onMounted(() => window.addEventListener("scroll", update));
  onUnmounted(() => window.removeEventListener("scroll", update));

  return { scrollDirection, isScrollingUp, currentScrollPos, prevScrollpos };
};
