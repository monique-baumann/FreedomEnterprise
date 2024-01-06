# Improvement proposals are welcome via https://github.com/monique-baumann/FreedomCash/issues/new

npm run build --prod 
cd ..
echo "updating links to ensure that the pages can be easily served e.g. via gh pages"
sed -i 's/href="\//href=".\//g' docs/index.html 
sed -i 's/src="\//src=".\//g' docs/index.html
cp -r ./docs/_app/ ./docs/app/
sed -i 's/_app/app/g' docs/investmentBets.html
sed -i 's/_app/app/g' docs/publicGoodsFunding.html
sed -i 's/_app/app/g' docs/philosophy.html
sed -i 's/_app/app/g' docs/geoCashing.html
sed -i 's/_app/app/g' docs/index.html
sed -i "s/timestampOfBuild/$(date +%s%N | cut -b1-13)/g" docs/philosophy.html
echo "copying constants for deno based volatility farming"
echo "ready for take off"