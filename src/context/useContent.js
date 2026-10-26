import { useContext } from 'react';
import ContentContext from './contentContextValue';

export const useContent = () => {
    const context = useContext(ContentContext);
    if (!context) {
        return {
            wpContent: null,
            wpProjects: [],
            loading: false,
            getText: (_sec, _key, fallback) => fallback,
            getImage: (_sec, _key, fallbackImg) => fallbackImg,
            getTeam: (fallbackTeam) => fallbackTeam,
            submitInquiry: async () => ({ success: true })
        };
    }
    return context;
};
