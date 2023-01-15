# shortcuts: translateAll
# desc: translate all apps with Google Translate

echo "$PWD"
ROOT="$PWD"

translate_package () {
    cd $ROOT
    cd $1
    al translate
}

(translate_package "apps/app-dashboard/src/config/i18n") &
(translate_package "apps/app-factory/src/config/i18n") &
(translate_package "apps/app-login/src/config/i18n") &
(translate_package "apps/app-mixer/src/config/i18n") &
(translate_package "apps/app-settings/src/config/i18n") &
(translate_package "extra/apps/app-biblo/src/config/i18n") &
(translate_package "extra/apps/app-campaigns/src/config/i18n") &
(translate_package "extra/apps/app-carts/src/config/i18n") &
(translate_package "extra/apps/app-comments/src/config/i18n") &
(translate_package "extra/apps/app-devtools/src/config/i18n") &
(translate_package "extra/apps/app-events/src/config/i18n") &
(translate_package "extra/apps/app-knowledge/src/config/i18n") &
(translate_package "extra/apps/app-leads/src/config/i18n") &
(translate_package "extra/apps/app-money/src/config/i18n") &
(translate_package "extra/apps/app-orders/src/config/i18n") &
(translate_package "extra/apps/app-ppl/src/config/i18n") &
(translate_package "extra/apps/app-products/src/config/i18n") &
(translate_package "extra/apps/app-sales/src/config/i18n") &
(translate_package "extra/apps/app-soundboard/src/config/i18n") &
(translate_package "extra/apps/app-studio/src/config/i18n") &
(translate_package "extra/apps/app-tasks/src/config/i18n") &
(translate_package "extra/apps/app-things/src/config/i18n") &
(translate_package "extra/apps/app-studio/src/config/i18n") &
(translate_package "extra/apps/app-voice/src/config/i18n") &

wait