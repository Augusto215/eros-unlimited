'use client'

import { useTranslation as useI18nTranslation } from '@/lib/i18n-provider'

// Re-export the hook with a shorter name for convenience
export const useTranslation = useI18nTranslation

// Helper hook for specific translation sections
export const useNavbarTranslation = () => {
  const { t } = useI18nTranslation()
  
  return {
    home: t('navbar.home'),
    about: t('navbar.about'),
    partner: t('navbar.partner'),
    releases: t('navbar.releases'),
    myMovies: t('navbar.myMovies'),
    login: t('navbar.login'),
    logout: t('navbar.logout'),
    loggingOut: t('navbar.loggingOut'),
  }
}

export const useAuthTranslation = () => {
  const { t } = useI18nTranslation()
  
  return {
    login: t('auth.login'),
    register: t('auth.register'),
    logout: t('auth.logout'),
    email: t('auth.email'),
    password: t('auth.password'),
    confirmPassword: t('auth.confirmPassword'),
    name: t('auth.name'),
    welcomeBack: t('auth.welcomeBack'),
    createAccount: t('auth.createAccount'),
    forgotPassword: t('auth.forgotPassword'),
    invalidCredentials: t('auth.invalidCredentials'),
    loginError: t('auth.loginError'),
    passwordMismatch: t('auth.passwordMismatch'),
    passwordMinLength: t('auth.passwordMinLength'),
    registerError: t('auth.registerError'),
    alreadyHaveAccount: t('auth.alreadyHaveAccount'),
    dontHaveAccount: t('auth.dontHaveAccount'),
    signIn: t('auth.signIn'),
    signUp: t('auth.signUp'),
    loveIsLove: t('auth.loveIsLove'),
    createdWithLove: t('auth.createdWithLove'),
    diversityInclusionLove: t('auth.diversityInclusionLove'),
    createAccountAndJoin: t('auth.createAccountAndJoin'),
    celebratingLove: t('auth.celebratingLove'),
    joinTheFamily: t('auth.joinTheFamily'),
    createMyAccount: t('auth.createMyAccount'),
    alreadyPartOfFamily: t('auth.alreadyPartOfFamily'),
    makeLogin: t('auth.makeLogin'),
    fullName: t('auth.fullName'),
    fullNamePlaceholder: t('auth.fullNamePlaceholder'),
    emailPlaceholder: t('auth.emailPlaceholder'),
    passwordPlaceholder: t('auth.passwordPlaceholder'),
    confirmPasswordPlaceholder: t('auth.confirmPasswordPlaceholder'),
    creatingAccount: t('auth.creatingAccount'),
    loginEmailPlaceholder: t('auth.loginEmailPlaceholder'),
    loginPasswordPlaceholder: t('auth.loginPasswordPlaceholder'),
  }
}

export const useMoviesTranslation = () => {
  const { t } = useI18nTranslation()
  
  return {
    title: t('movies.title'),
    genres: t('movies.genres'),
    duration: t('movies.duration'),
    rating: t('movies.rating'),
    releaseDate: t('movies.releaseDate'),
    director: t('movies.director'),
    cast: t('movies.cast'),
    synopsis: t('movies.synopsis'),
    watchNow: t('movies.watchNow'),
    addToList: t('movies.addToList'),
    rent: t('movies.rent'),
    buy: t('movies.buy'),
    purchased: t('movies.purchased'),
    watchTrailer: t('movies.watchTrailer'),
    addNewMovie: t('movies.addNewMovie'),
  }
}

export const useCommonTranslation = () => {
  const { t } = useI18nTranslation()
  
  return {
    loading: t('common.loading'),
    error: t('common.error'),
    success: t('common.success'),
    cancel: t('common.cancel'),
    confirm: t('common.confirm'),
    save: t('common.save'),
    delete: t('common.delete'),
    edit: t('common.edit'),
    close: t('common.close'),
    backToHome: t('common.backToHome'),
  }
}

export const useAboutTranslation = () => {
  const { t } = useI18nTranslation()
  
  return {
    title: t('about.title'),
    ourStory: t('about.ourStory'),
    mission: t('about.mission'),
    awards: t('about.awards'),
    filmography: t('about.filmography'),
    watchTrailer: t('about.watchTrailer'),
    year: t('about.year'),
    genre: t('about.genre'),
    duration: t('about.duration'),
    description: t('about.description'),
  }
}

export const useHomeTranslation = () => {
  const { t } = useI18nTranslation()
  
  return {
    featuredMovies: t('home.featuredMovies'),
    newReleases: t('home.newReleases'),
    trending: t('home.trending'),
    welcomeMessage: t('home.welcomeMessage'),
    subtitle: t('home.subtitle'),
  }
}

export const usePartnerTranslation = () => {
  const { t } = useI18nTranslation()
  
  return {
    title: t('partner.title'),
    subtitle: t('partner.subtitle'),
    benefits: t('partner.benefits'),
    contact: t('partner.contact'),
  }
}

export const useReleasesTranslation = () => {
  const { t } = useI18nTranslation()
  
  return {
    title: t('releases.title'),
    latest: t('releases.latest'),
    comingSoon: t('releases.comingSoon'),
  }
}

export const usePaymentTranslation = () => {
  const { t } = useI18nTranslation()
  
  return {
    success: t('payment.success'),
    processing: t('payment.processing'),
    failed: t('payment.failed'),
    total: t('payment.total'),
    payNow: t('payment.payNow'),
  }
}

export const useUserTranslation = () => {
  const { t } = useI18nTranslation()
  
  return {
    profile: t('user.profile'),
    myMovies: t('user.myMovies'),
    settings: t('user.settings'),
    purchaseHistory: t('user.purchaseHistory'),
  }
}

export const useFilmSynopsisTranslation = () => {
  const { t } = useI18nTranslation()
  
  return {
    getSynopsis: (filmId: string, fallback: string = '') => {
      const translatedSynopsis = t(`filmSynopsis.${filmId}`)
      // Se a tradução não existir (retorna a chave), use o fallback
      return translatedSynopsis.startsWith('filmSynopsis.') ? fallback : translatedSynopsis
    }
  }
}

export const useFilmTitleTranslation = () => {
  const { t } = useI18nTranslation()
  
  return {
    getTitle: (filmId: string, fallback: string = '') => {
      const translatedTitle = t(`filmTitles.${filmId}`)
      // Se a tradução não existir (retorna a chave), use o fallback
      return translatedTitle.startsWith('filmTitles.') ? fallback : translatedTitle
    }
  }
}

export const useFilmGenreTranslation = () => {
  const { t } = useI18nTranslation()
  
  return {
    getGenre: (filmId: string, fallback: string = '') => {
      const translatedGenre = t(`filmGenres.${filmId}`)
      // Se a tradução não existir (retorna a chave), use o fallback
      return translatedGenre.startsWith('filmGenres.') ? fallback : translatedGenre
    }
  }
}
