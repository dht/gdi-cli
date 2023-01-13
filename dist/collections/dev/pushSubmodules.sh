# shortcuts: subm
# desc: pushes submodules

echo "$PWD"
ROOT="$PWD"

push_package () {
    cd $ROOT
    cd $1
    git add .
    git commit -am "wip"
    git push
}

(push_package "submodules/gdi-datasets") &
(push_package "submodules/igrid") &
(push_package "submodules/redux-connected") &
(push_package "submodules/shared-base") &
(push_package "submodules/testing-base") &

wait

echo "done"



