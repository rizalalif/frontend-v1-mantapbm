import { ref } from 'vue';

const currentPaketName = ref('');
const currentUserName = ref('');

export function useBreadcrumb() {
  const setPaketName = (name) => {
    currentPaketName.value = name || '';
  };
  const clearPaketName = () => {
    currentPaketName.value = '';
  };

  const setUserName = (name) => {
    currentUserName.value = name || '';
  };
  const clearUserName = () => {
    currentUserName.value = '';
  };

  return {
    currentPaketName,
    setPaketName,
    clearPaketName,
    currentUserName,
    setUserName,
    clearUserName
  };
}
