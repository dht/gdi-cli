# shortcuts: depCheck
# desc: check dependencies for all packages

echo "$PWD"
ROOT="$PWD"

depcheck_package () {
    cd $ROOT
    cd $1
    depcheck >.depcheck
}

(depcheck_package "packages/gdi-engine") &
(depcheck_package "packages/gdi-language") &
(depcheck_package "packages/gdi-web-base-ui") &
(depcheck_package "packages/gdi-web-editors") &
(depcheck_package "packages/gdi-web-forms") &
(depcheck_package "packages/gdi-web-tables") &
(depcheck_package "packages/gdi-web-ui") &
(depcheck_package "packages/gdi-photo-booth") &
(depcheck_package "packages/gdi-uno") &
(depcheck_package "packages/isokit") &
(depcheck_package "stores/gdi-store-auth") &
(depcheck_package "stores/gdi-store-dashboard") &
(depcheck_package "stores/gdi-store-factory") &
(depcheck_package "stores/gdi-store-mixer") &
(depcheck_package "stores/gdi-store-settings") &
(depcheck_package "stores/gdi-store-site") &
(depcheck_package "packages/platformer") &
(depcheck_package "packages/gdi-template-card") &
(depcheck_package "packages/gdi-template-gdi") &
(depcheck_package "packages/gdi-template-starter") &
(depcheck_package "packages/gdi-template-tech") &
(depcheck_package "apps/app-dashboard") &
(depcheck_package "apps/app-factory") &
(depcheck_package "apps/app-login") &
(depcheck_package "apps/app-mixer") &
(depcheck_package "apps/app-settings") &
(depcheck_package "extra/stores/gdi-store-biblo") &
(depcheck_package "extra/stores/gdi-store-campaigns") &
(depcheck_package "extra/stores/gdi-store-carts") &
(depcheck_package "extra/stores/gdi-store-comments") &
(depcheck_package "extra/stores/gdi-store-devtools") &
(depcheck_package "extra/stores/gdi-store-events") &
(depcheck_package "extra/stores/gdi-store-knowledge") &
(depcheck_package "extra/stores/gdi-store-leads") &
(depcheck_package "extra/stores/gdi-store-money") &
(depcheck_package "extra/stores/gdi-store-orders") &
(depcheck_package "extra/stores/gdi-store-ppl") &
(depcheck_package "extra/stores/gdi-store-products") &
(depcheck_package "extra/stores/gdi-store-sales") &
(depcheck_package "extra/stores/gdi-store-soundboard") &
(depcheck_package "extra/stores/gdi-store-studio") &
(depcheck_package "extra/stores/gdi-store-tasks") &
(depcheck_package "extra/stores/gdi-store-things") &
(depcheck_package "extra/stores/gdi-store-voice") &
(depcheck_package "extra/stores/gdi-store-weather") &
(depcheck_package "extra/apps/app-biblo") &
(depcheck_package "extra/apps/app-campaigns") &
(depcheck_package "extra/apps/app-carts") &
(depcheck_package "extra/apps/app-comments") &
(depcheck_package "extra/apps/app-devtools") &
(depcheck_package "extra/apps/app-events") &
(depcheck_package "extra/apps/app-knowledge") &
(depcheck_package "extra/apps/app-leads") &
(depcheck_package "extra/apps/app-money") &
(depcheck_package "extra/apps/app-orders") &
(depcheck_package "extra/apps/app-ppl") &
(depcheck_package "extra/apps/app-products") &
(depcheck_package "extra/apps/app-sales") &
(depcheck_package "extra/apps/app-soundboard") &
(depcheck_package "extra/apps/app-tasks") &
(depcheck_package "extra/apps/app-things") &
(depcheck_package "extra/apps/app-studio") &
(depcheck_package "extra/apps/app-voice") &

wait

echo "done"