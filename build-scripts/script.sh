#!/bin/bash
echo
echo "Building script ... "
echo

# Permission to Github package repository is required
npm set //npm.pkg.github.com/:_authToken $GITHUB_API_KEY

cd $TRAVIS_BUILD_DIR
# TODO: Build with --prod only when publishing to nmp repository, and not always
if ./gradlew npmBuildAngularLibraryProd; then    
    echo
else        
    echo
    echo "Building script FAILED"
    echo
    exit 1
fi
