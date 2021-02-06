#!/bin/bash
echo
echo "Deploying docs ..."
echo

# The Angular docs must have been created in $BUILD_DIR/docs-build/doc-frontend-gui with Compodoc
if [ -n "$GITHUB_API_KEY" ]; then
    cd "$BUILD_DIR"/docs-build        
    rm -r -f sitmun.github.io
    git clone https://github.com/sitmun/sitmun.github.io.git
    cd sitmun.github.io
    cp -r "$BUILD_DIR"/docs-build/doc-frontend-gui .    
    # In GitHub Actions, set user and email for git repo
    if [ -n "$CI" ]; then
      git config user.name "GitHub Actions Bot"
      git config user.email "<>"
    fi
    git add doc-frontend-gui/*
    git commit -m "Automatic update of the docs"
    # Make sure to make the output quiet, or else the API token will leak!
    # This works because the API key can replace your password.
    git push -q https://$USERNAME:$GITHUB_API_KEY@github.com/sitmun/sitmun.github.io master &>/dev/null    
fi
