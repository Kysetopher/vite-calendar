/**
 * Mobile keyboard handling utilities (scoped to chat page only)
 * Prevents layout jump when virtual keyboard opens, without freezing other routes.
 */

function isMobileUA() {
  return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

/**
 * Injects styles scoped under `body.chat-page` only.
 * Returns a cleanup function that removes the style element.
 */
export function addKeyboardStyles() {
  const style = document.createElement("style");
  style.setAttribute("data-chat-mobile-styles", "true");
  style.textContent = `
    /* Use stable viewport units when available */
    @supports (height: 100svh) {
      body.chat-page .page-container {
        height: 100svh !important;
        min-height: 100svh !important;
      }
    }
    @supports not (height: 100svh) {
      body.chat-page .page-container {
        height: 100vh !important;
        min-height: 100vh !important;
      }
    }

    /* NOTE: We no longer freeze html/body globally. Everything is scoped. */

    /* Optional utility if you want chat input/nav fixed on small screens */
    @media (max-width: 768px) {
      body.chat-page .message-input {
        /* JS will pin on focus; this is a sane default if the component ships fixed */
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: 100;
        width: 100%;
        box-sizing: border-box;
        background: white;
        border-top: 1px solid #e5e7eb;
      }

      /* If you have a bottom nav, keep it pinned. Remove if not needed. */
      body.chat-page .bottom-nav {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: 101;
        height: 60px;
        background: white;
        border-top: 1px solid #e5e7eb;
      }

      /* The scrollable list area; height can be driven by layout + JS padding */
      body.chat-page .message-list {
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
      }
    }

    /* When keyboard is visible, allow extra room (JS also adds paddingBottom) */
    body.chat-page.keyboard-visible .message-list {
      /* This is a guard; JS will fine-tune with paddingBottom */
    }
  `;
  document.head.appendChild(style);

  return () => {
    style.remove();
  };
}

/**
 * Attaches mobile keyboard handlers.
 * Only runs on mobile AND when `body.chat-page` is present.
 * Returns a cleanup function to remove listeners and inline styles.
 */
export function setupMobileKeyboardHandling() {
  if (!isMobileUA()) return () => {};
  if (!document.body.classList.contains("chat-page")) return () => {};

  let initialViewportHeight = window.innerHeight;
  let isKeyboardVisible = false;

  function handleViewportChange() {
    const currentHeight = window.innerHeight;
    const heightDifference = initialViewportHeight - currentHeight;

    const prev = isKeyboardVisible;
    // Heuristic threshold for keyboard open
    isKeyboardVisible = heightDifference > 150;

    if (isKeyboardVisible !== prev) {
      document.body.classList.toggle("keyboard-visible", isKeyboardVisible);

      // If you keep a container you want to resize, you can use it here:
      const messageContainer = document.querySelector(
        "body.chat-page .messages-container"
      ) as HTMLElement | null;

      if (messageContainer) {
        messageContainer.style.height = isKeyboardVisible
          ? `${currentHeight - 60}px`
          : "";
      }
    }
  }

  function handleInputFocus(event: FocusEvent) {
    const input = event.target as HTMLElement;
    if (!input) return;

    if (input.tagName === "TEXTAREA" || input.tagName === "INPUT") {
      const messageInput = document.querySelector(
        "body.chat-page .message-input"
      ) as HTMLElement | null;
      const messageList = document.querySelector(
        "body.chat-page .message-list"
      ) as HTMLElement | null;

      if (messageInput) {
        // Pin input above the keyboard; reversible on cleanup
        messageInput.style.position = "fixed";
        messageInput.style.bottom = "0px";
        messageInput.style.left = "0px";
        messageInput.style.right = "0px";
        messageInput.style.zIndex = "9999";
      }

      if (messageList && messageInput) {
        // Pad the list so last message isn't hidden behind the input
        const applyPadding = () => {
          const inputHeight = messageInput.offsetHeight;
          messageList.style.paddingBottom = `${inputHeight + 20}px`;
          // Nudge viewport so caret is visible
          window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
        };

        // Delay slightly to allow layout to settle after keyboard opens
        setTimeout(applyPadding, 100);
      }
    }
  }

  const handleOrientationChange = () => {
    setTimeout(() => {
      initialViewportHeight = window.innerHeight;
      handleViewportChange();
    }, 500);
  };

  const handleFocusOut = () => {
    setTimeout(handleViewportChange, 300);
  };

  window.addEventListener("resize", handleViewportChange);
  window.addEventListener("orientationchange", handleOrientationChange);
  document.addEventListener("focusin", handleInputFocus);
  document.addEventListener("focusout", handleFocusOut);

  // Cleanup: detach listeners and reset inline styles
  return () => {
    window.removeEventListener("resize", handleViewportChange);
    window.removeEventListener("orientationchange", handleOrientationChange);
    document.removeEventListener("focusin", handleInputFocus);
    document.removeEventListener("focusout", handleFocusOut);

    document.body.classList.remove("keyboard-visible");

    const messageContainer = document.querySelector(
      "body.chat-page .messages-container"
    ) as HTMLElement | null;
    const messageInput = document.querySelector(
      "body.chat-page .message-input"
    ) as HTMLElement | null;
    const messageList = document.querySelector(
      "body.chat-page .message-list"
    ) as HTMLElement | null;

    if (messageContainer) messageContainer.style.height = "";
    if (messageInput) {
      messageInput.style.position = "";
      messageInput.style.bottom = "";
      messageInput.style.left = "";
      messageInput.style.right = "";
      messageInput.style.zIndex = "";
    }
    if (messageList) messageList.style.paddingBottom = "";
  };
}
