import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Arabic translations
const ar = {
  translation: {
    // Navigation
    nav: {
      title: 'صندوق فتوى',
      subtitle: 'مسجد الإيمان',
      askQuestion: 'اطرح سؤالك',
    },
    // Hero
    hero: {
      title: 'صندوق فتوى',
      subtitle: 'مسجد الإيمان - 150 مسكن',
      description: 'نجمع استفساراتكم الشرعية ويتم الإجابة عليها في حلقات دورية بإذن الله',
    },
    // Question Form
    form: {
      title: 'اطرح سؤالك',
      description: 'أرسل استفساراتك الشرعية وسيتم الإجابة عليها في الحلقة القادمة بإذن الله',
      categoryLabel: 'نوع الفتوى',
      categoryPlaceholder: 'اختر نوع الفتوى',
      questionLabel: 'السؤال',
      questionPlaceholder: 'اكتب سؤالك هنا...',
      customCategoryPlaceholder: 'اكتب نوع الفتوى...',
      submit: 'إرسال السؤال',
      submitting: 'جارٍ الإرسال...',
      required: '*',
      successTitle: 'وصل سؤالك',
      successMessage: 'سيتم الإجابة عليه في الحلقة القادمة إن شاء الله',
      submitAnother: 'إرسال سؤال آخر',
      questionsReceived: 'سؤال مستلم',
    },
    // Box Status
    box: {
      closed: 'صندوق الفتوى مغلق حاليًا',
      closedMessage: 'يُرجى العودة في وقت لاحق للمشاركة بأسئلتكم',
    },
    // Countdown
    countdown: {
      title: 'الحلقة القادمة',
      days: 'يوم',
      hours: 'ساعة',
      minutes: 'دقيقة',
      seconds: 'ثانية',
    },
    // Footer
    footer: {
      mosqueName: 'مسجد الإيمان – 150 مسكن',
    },
    // Common
    common: {
      loading: 'جارٍ التحميل...',
      error: 'خطأ',
      success: 'تم بنجاح',
      alert: 'تنبيه',
      close: 'إغلاق',
    },
    // Categories
    categories: {
      worship: 'العبادات',
      transactions: 'المعاملات',
      family: 'الأسرة والأحوال الشخصية',
      food: 'الأطعمة والأشربة',
      ethics: 'الأخلاق والسلوك',
      other: 'أخرى',
    },
    // Admin
    admin: {
      title: 'لوحة التحكم',
      password: 'كلمة المرور',
      passwordPlaceholder: 'أدخل كلمة المرور',
      login: 'دخول',
      verifying: 'جارٍ التحقق...',
      wrongPassword: 'كلمة المرور غير صحيحة',
      verifyError: 'حدث خطأ أثناء التحقق',
      tabs: {
        questions: 'الأسئلة',
        videos: 'الفيديو',
        announcements: 'الإعلانات',
        flash: 'فلاش',
        settings: 'الإعدادات',
      },
      questions: {
        received: 'سؤال مستلم',
        export: 'تصدير',
        selectAll: 'تحديد الكل',
        unselectAll: 'إلغاء التحديد',
        deleteSelected: 'حذف المحدد',
        deleteAll: 'حذف الكل',
        noQuestions: 'لا توجد أسئلة حتى الآن',
        confirmDelete: 'تأكيد الحذف',
        confirmDeleteMessage: 'هل أنت متأكد من حذف هذا السؤال؟ لا يمكن التراجع عن هذا الإجراء.',
        cancel: 'إلغاء',
      },
      videos: {
        title: 'إضافة فيديو جديد',
        titlePlaceholder: 'عنوان الفيديو',
        urlPlaceholder: 'رابط YouTube',
        add: 'إضافة الفيديو',
        adding: 'جارٍ الإضافة...',
        noVideos: 'لا توجد فيديوهات',
        current: 'الفيديوهات الحالية',
      },
      settings: {
        boxStatus: 'حالة الصندوق',
        boxOpen: 'الصندوق مفتوح للأسئلة',
        boxClosed: 'الصندوق مغلق حاليًا',
        countdown: 'العداد التنازلي',
        countdownVisible: 'العداد ظاهر في الصفحة الرئيسية',
        countdownHidden: 'العداد مخفي',
        nextSession: 'موعد الحلقة القادمة',
        save: 'حفظ',
        showQuestionCount: 'عداد الأسئلة',
        showQuestionCountDescription: 'إظهار عدد الأسئلة المستلمة تحت الصندوق',
      },
    },
    // Toasts
    toast: {
      categoryRequired: 'يرجى اختيار التصنيف وكتابة السؤال',
      customCategoryRequired: 'يرجى كتابة نوع الفتوى',
      submitError: 'حدث خطأ أثناء إرسال السؤال',
      updated: 'تم التحديث',
      deleted: 'تم الحذف',
      saved: 'تم الحفظ',
      newQuestion: 'سؤال جديد',
      newQuestionReceived: 'تم استلام سؤال جديد',
    },
  },
};

// French translations
const fr = {
  translation: {
    nav: {
      title: 'Boîte Fatwa',
      subtitle: 'Mosquée Al-Iman',
      askQuestion: 'Posez votre question',
    },
    hero: {
      title: 'Boîte Fatwa',
      subtitle: 'Mosquée Al-Iman - 150 Maskan',
      description: 'Nous recueillons vos questions religieuses et y répondons lors de sessions périodiques, incha Allah',
    },
    form: {
      title: 'Posez votre question',
      description: 'Envoyez vos questions religieuses et elles seront répondues lors de la prochaine session, incha Allah',
      categoryLabel: 'Type de Fatwa',
      categoryPlaceholder: 'Choisissez le type de fatwa',
      questionLabel: 'Question',
      questionPlaceholder: 'Écrivez votre question ici...',
      customCategoryPlaceholder: 'Écrivez le type de fatwa...',
      submit: 'Envoyer la question',
      submitting: 'Envoi en cours...',
      required: '*',
      successTitle: 'Question reçue',
      successMessage: 'Elle sera répondue lors de la prochaine session, incha Allah',
      submitAnother: 'Envoyer une autre question',
      questionsReceived: 'questions reçues',
    },
    box: {
      closed: 'La boîte Fatwa est actuellement fermée',
      closedMessage: 'Veuillez revenir plus tard pour participer',
    },
    countdown: {
      title: 'Prochaine session',
      days: 'jours',
      hours: 'heures',
      minutes: 'minutes',
      seconds: 'secondes',
    },
    footer: {
      mosqueName: 'Mosquée Al-Iman – 150 Maskan',
    },
    common: {
      loading: 'Chargement...',
      error: 'Erreur',
      success: 'Succès',
      alert: 'Alerte',
      close: 'Fermer',
    },
    categories: {
      worship: 'Adoration',
      transactions: 'Transactions',
      family: 'Famille et statut personnel',
      food: 'Nourriture et boissons',
      ethics: 'Éthique et comportement',
      other: 'Autre',
    },
    admin: {
      title: 'Panneau de contrôle',
      password: 'Mot de passe',
      passwordPlaceholder: 'Entrez le mot de passe',
      login: 'Connexion',
      verifying: 'Vérification...',
      wrongPassword: 'Mot de passe incorrect',
      verifyError: 'Erreur de vérification',
      tabs: {
        questions: 'Questions',
        videos: 'Vidéos',
        announcements: 'Annonces',
        flash: 'Flash',
        settings: 'Paramètres',
      },
      questions: {
        received: 'question reçue',
        export: 'Exporter',
        selectAll: 'Tout sélectionner',
        unselectAll: 'Désélectionner',
        deleteSelected: 'Supprimer la sélection',
        deleteAll: 'Tout supprimer',
        noQuestions: 'Aucune question pour le moment',
        confirmDelete: 'Confirmer la suppression',
        confirmDeleteMessage: 'Êtes-vous sûr de vouloir supprimer? Cette action est irréversible.',
        cancel: 'Annuler',
      },
      videos: {
        title: 'Ajouter une nouvelle vidéo',
        titlePlaceholder: 'Titre de la vidéo',
        urlPlaceholder: 'Lien YouTube',
        add: 'Ajouter la vidéo',
        adding: 'Ajout en cours...',
        noVideos: 'Aucune vidéo',
        current: 'Vidéos actuelles',
      },
      settings: {
        boxStatus: 'État de la boîte',
        boxOpen: 'La boîte est ouverte aux questions',
        boxClosed: 'La boîte est actuellement fermée',
        countdown: 'Compte à rebours',
        countdownVisible: 'Le compte à rebours est visible',
        countdownHidden: 'Le compte à rebours est masqué',
        nextSession: 'Prochaine session',
        save: 'Enregistrer',
        showQuestionCount: 'Compteur de questions',
        showQuestionCountDescription: 'Afficher le nombre de questions reçues sous la boîte',
      },
    },
    toast: {
      categoryRequired: 'Veuillez choisir une catégorie et écrire la question',
      customCategoryRequired: 'Veuillez écrire le type de fatwa',
      submitError: 'Erreur lors de l\'envoi de la question',
      updated: 'Mis à jour',
      deleted: 'Supprimé',
      saved: 'Enregistré',
      newQuestion: 'Nouvelle question',
      newQuestionReceived: 'Une nouvelle question a été reçue',
    },
  },
};

// English translations
const en = {
  translation: {
    nav: {
      title: 'Fatwa Box',
      subtitle: 'Al-Iman Mosque',
      askQuestion: 'Ask a Question',
    },
    hero: {
      title: 'Fatwa Box',
      subtitle: 'Al-Iman Mosque - 150 Maskan',
      description: 'We collect your religious questions and answer them in periodic sessions, God willing',
    },
    form: {
      title: 'Ask Your Question',
      description: 'Send your religious questions and they will be answered in the next session, God willing',
      categoryLabel: 'Fatwa Type',
      categoryPlaceholder: 'Choose fatwa type',
      questionLabel: 'Question',
      questionPlaceholder: 'Write your question here...',
      customCategoryPlaceholder: 'Write the fatwa type...',
      submit: 'Submit Question',
      submitting: 'Submitting...',
      required: '*',
      successTitle: 'Question Received',
      successMessage: 'It will be answered in the next session, God willing',
      submitAnother: 'Submit Another Question',
      questionsReceived: 'questions received',
    },
    box: {
      closed: 'Fatwa Box is Currently Closed',
      closedMessage: 'Please come back later to participate',
    },
    countdown: {
      title: 'Next Session',
      days: 'days',
      hours: 'hours',
      minutes: 'minutes',
      seconds: 'seconds',
    },
    footer: {
      mosqueName: 'Al-Iman Mosque – 150 Maskan',
    },
    common: {
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      alert: 'Alert',
      close: 'Close',
    },
    categories: {
      worship: 'Worship',
      transactions: 'Transactions',
      family: 'Family & Personal Status',
      food: 'Food & Drinks',
      ethics: 'Ethics & Behavior',
      other: 'Other',
    },
    admin: {
      title: 'Control Panel',
      password: 'Password',
      passwordPlaceholder: 'Enter password',
      login: 'Login',
      verifying: 'Verifying...',
      wrongPassword: 'Incorrect password',
      verifyError: 'Verification error',
      tabs: {
        questions: 'Questions',
        videos: 'Videos',
        announcements: 'Announcements',
        flash: 'Flash',
        settings: 'Settings',
      },
      questions: {
        received: 'question received',
        export: 'Export',
        selectAll: 'Select All',
        unselectAll: 'Unselect All',
        deleteSelected: 'Delete Selected',
        deleteAll: 'Delete All',
        noQuestions: 'No questions yet',
        confirmDelete: 'Confirm Delete',
        confirmDeleteMessage: 'Are you sure you want to delete? This action cannot be undone.',
        cancel: 'Cancel',
      },
      videos: {
        title: 'Add New Video',
        titlePlaceholder: 'Video title',
        urlPlaceholder: 'YouTube link',
        add: 'Add Video',
        adding: 'Adding...',
        noVideos: 'No videos',
        current: 'Current videos',
      },
      settings: {
        boxStatus: 'Box Status',
        boxOpen: 'Box is open for questions',
        boxClosed: 'Box is currently closed',
        countdown: 'Countdown Timer',
        countdownVisible: 'Countdown is visible on homepage',
        countdownHidden: 'Countdown is hidden',
        nextSession: 'Next Session Date',
        save: 'Save',
        showQuestionCount: 'Question Counter',
        showQuestionCountDescription: 'Show number of questions received below the box',
      },
    },
    toast: {
      categoryRequired: 'Please choose a category and write the question',
      customCategoryRequired: 'Please write the fatwa type',
      submitError: 'Error submitting question',
      updated: 'Updated',
      deleted: 'Deleted',
      saved: 'Saved',
      newQuestion: 'New Question',
      newQuestionReceived: 'A new question has been received',
    },
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      ar,
      fr,
      en,
    },
    fallbackLng: 'ar',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;
