# X CLI Troubleshooting

Common issues and solutions.

## Authentication Issues

### "Not authenticated" error
**Problem:** Commands fail with authentication error.

**Solution:**
```bash
# Check current status
x auth status

# If not logged in, authenticate
x auth login

# If token expired, refresh
x auth refresh
```

### OAuth login fails
**Problem:** Browser opens but login doesn't complete.

**Solutions:**
1. Ensure you're using a browser that allows popups
2. Check that the callback URL is accessible (localhost:8787)
3. Try logging out first, then login again:
   ```bash
   x auth logout
   x auth login
   ```

### Token refresh fails
**Problem:** Token refresh returns error.

**Solution:**
```bash
# Clear tokens and re-authenticate
x auth logout
x auth login
```

---

## Rate Limit Issues

### "Rate limit exceeded" error
**Problem:** Too many requests in a short time.

**Solutions:**
1. Wait for the rate limit window to reset (usually 15 minutes)
2. Use `--verbose` to see rate limit headers:
   ```bash
   x timeline home --verbose
   ```
3. Reduce request frequency in scripts:
   ```bash
   sleep 2  # Add delays between commands
   ```

### Auto-retry not working
**Problem:** Commands fail immediately on rate limit.

**Solution:** The CLI auto-retries on 429 with exponential backoff. If you see immediate failures, check:
- Your internet connection
- X API status at https://api.twitterstat.us/

---

## Grok Issues

### "XAI_API_KEY not set" error
**Problem:** Grok commands fail without API key.

**Solution:**
```bash
# Set the environment variable
export XAI_API_KEY="your-api-key"

# Or add to your shell profile
echo 'export XAI_API_KEY="your-key"' >> ~/.bashrc
source ~/.bashrc
```

Get an API key from https://x.ai/

### Grok returns empty/poor results
**Problem:** Summarization or analysis gives poor output.

**Solutions:**
1. Ensure the post/user exists
2. Try `--length detailed` for more context:
   ```bash
   x grok summarize @username --length detailed
   ```
3. Check if the account has recent public posts

---

## Command Not Found

### "x: command not found"
**Problem:** CLI not in PATH.

**Solutions:**

If installed via npm:
```bash
npm install -g x-cli
# or
bun install -g x-cli
```

If built from source:
```bash
# Add to PATH
export PATH="$PATH:/path/to/x-cli/dist"

# Or create alias
alias x="/path/to/x-cli/dist/x"
```

### Completions not working
**Problem:** Tab completion doesn't work.

**Solution:** Install completions for your shell:
```bash
# Bash
x completion bash >> ~/.bashrc
source ~/.bashrc

# Zsh
x completion zsh >> ~/.zshrc
source ~/.zshrc

# Fish
x completion fish > ~/.config/fish/completions/x.fish
```

---

## API Errors

### "User not found" error
**Problem:** User lookup fails.

**Solutions:**
1. Check username spelling (case-sensitive)
2. User may have changed their username
3. Account may be suspended or deleted
4. Try without @ symbol:
   ```bash
   x user elonmusk  # correct
   x user @elonmusk # incorrect
   ```

### "Tweet not found" error
**Problem:** Can't get/interact with a post.

**Possible causes:**
1. Post was deleted
2. Post is from a private/protected account
3. Invalid post ID
4. Post ID from wrong format (use numeric ID, not URL)

**Get ID from URL:**
```
https://x.com/user/status/1234567890
                        ^^^^^^^^^^
                        This is the ID
```

### "Forbidden" error (403)
**Problem:** Action not allowed.

**Common causes:**
1. Trying to delete someone else's post
2. Blocked by the user you're trying to interact with
3. Your account is restricted
4. Missing required permissions (re-authenticate)

**Solution:**
```bash
x auth logout
x auth login
```

### "Not authorized" error (401)
**Problem:** Authentication token invalid.

**Solution:**
```bash
x auth refresh
# If that fails:
x auth logout
x auth login
```

---

## Media Upload Issues

### Upload fails for large files
**Problem:** Video upload times out or fails.

**Solutions:**
1. Check file size limits:
   - Images: 5MB max for simple upload
   - Videos: 512MB max (chunked upload)
2. Ensure supported format: PNG, JPEG, GIF, MP4, MOV
3. Try again - network issues can cause failures
4. Check upload status:
   ```bash
   x media status <media_id>
   ```

### "Processing failed" status
**Problem:** Media uploaded but processing failed.

**Solutions:**
1. File may be corrupted - try re-encoding
2. Video codec not supported - convert to H.264
3. Try uploading again with a different file

---

## Output Issues

### JSON output is empty
**Problem:** `--json` flag returns nothing.

**Solutions:**
1. Ensure the command succeeded (check for errors first)
2. Some commands may not have data to return
3. Try without `--json` first to verify

### Colors not showing
**Problem:** Output is plain text without colors.

**Solutions:**
1. Terminal must support ANSI colors
2. Check if `--no-color` flag is set
3. Check `TERM` environment variable:
   ```bash
   echo $TERM  # Should be xterm-256color or similar
   ```

### Table formatting broken
**Problem:** Tables display incorrectly.

**Solutions:**
1. Terminal width may be too narrow - resize
2. Use `--json` for programmatic access
3. Check terminal font supports box-drawing characters

---

## Interactive Mode Issues

### History not saving
**Problem:** Command history lost between sessions.

**Note:** History is session-only by design. Use shell history for persistent storage.

### Tab completion not working in REPL
**Problem:** Tab doesn't autocomplete in interactive mode.

**Solutions:**
1. Ensure readline is supported
2. Try typing partial command, then Tab
3. May not work in all terminal emulators

---

## Configuration Issues

### Config changes not applying
**Problem:** Settings don't seem to take effect.

**Solutions:**
1. Verify config was saved:
   ```bash
   x config list
   ```
2. Check config file location:
   ```bash
   cat ~/.config/x-cli/config.json
   ```
3. Reset and reconfigure:
   ```bash
   x config reset
   x config set default_output json
   ```

### Config file permissions
**Problem:** Can't write config file.

**Solution:**
```bash
# Fix permissions
chmod 700 ~/.config/x-cli
chmod 600 ~/.config/x-cli/config.json
```

---

## Network Issues

### Timeout errors
**Problem:** Commands take too long and timeout.

**Solutions:**
1. Check internet connection
2. X API may be experiencing issues
3. Try again later
4. Use `--verbose` to see what's happening

### SSL/TLS errors
**Problem:** Certificate or SSL errors.

**Solutions:**
1. Update your system's CA certificates
2. Check system time is correct
3. Check if behind a proxy that modifies HTTPS

---

## Getting Help

### Verbose output
Use `--verbose` to see detailed request/response info:
```bash
x timeline home --verbose
```

### Check version
```bash
x --version
```

### Report issues
If problems persist, report at: https://github.com/ps/x-cli/issues

Include:
- Command that failed
- Error message
- Output of `x --version`
- OS and terminal info
