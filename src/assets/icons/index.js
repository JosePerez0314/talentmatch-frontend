// --- LOGOS ---
import logoLarge from "./Logo_TalentMatch_AI.svg";
import logoSmall from "./Logo_TalentMatch_AI_Small.svg";

// --- LOGIN ---
import mail from "./icon_mail_login.svg";
import lock from "./icon_lock.svg";
import loading from "./icon_loading_refresh.svg";
import eyeOpen from "./icon_eye_open.svg";
import eyeClosed from "./icon_eye_closed.svg"; 

// --- SIDEBAR ---
import dashboard from "./icon_dashboard.svg";
import positionCreateSlide from "./icon_position_create_slide.svg";
import uploadCvSlide from "./icon_upload_cv_slide.svg";
import vacantCreate from "./icon_vacant_create.svg";
import eyeHistory from "./icon_eye_history.svg";
import historyVacant from "./icon_history_vacant.svg";
import historyPosition from "./icon_history_position.svg";
import resultsTrophy from "./icon_results_trophy.svg";

// --- DASHBOARD & STAT CARDS ---
import eyeHistoryGray from "./icon_eye_history.svg";
import posCreatedBlue from "./icon_position_created_blue.svg";
import vacantCreateBlue from "./icon_vacant_create_blue.svg";
import vacantActiveBlue from "./icon_vacant_active_blue.svg";
import createPlus from "./icon_create_circleplus.svg";
import uploadCv from "./icon_upload_cv.svg";
import vacantCreateBtn from "./icon_vacant_create_buttom.svg";
import checkBlue from "./icon_check_blue.svg";

// --- Layout ---
import logOut from "./icon_log_out.svg";

// --- EXPORT UNIF ---
export const Icons = {
    logos: {
        large: logoLarge,
        small: logoSmall,
    },
    auth: {
        mail,
        lock,
        loading,
        eyeOpen,
        eyeClosed,
    },
    sidebar: {
        dashboard,
        positionCreate: positionCreateSlide,
        uploadCv: uploadCvSlide,
        vacant: vacantCreate,
        history: eyeHistory,
        historyVacant,
        historyPosition,
        trophy: resultsTrophy,
    },
    stats: {
        posCreatedBlue,
        vacantCreateBlue,
        vacantActiveBlue,
        createPlus,
        uploadCv,
        vacantCreateBtn,
        eyeHistoryGray,
        checkBlue,
    },
    layout: {
        logOut
    }
};