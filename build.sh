echo building scpmultisig.wasm from AssemblyScript...
pushd assembly
yarn install
yarn run asbuild
base64 -w 0 .klave/0-scpmultisig.wasm > ../config/wasm/scp_multisig.b64
popd
echo done
