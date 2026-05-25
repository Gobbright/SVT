const menuButton = document.querySelector(".menu-toggle");
const siteNav = document.querySelector(".site-nav");

if (menuButton && siteNav) {
  menuButton.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("hidden") === false;
    siteNav.classList.toggle("flex", isOpen);
    menuButton.setAttribute("aria-expanded", String(isOpen));
    const menuIcon = menuButton.querySelector("[data-menu-icon]");
    if (menuIcon) {
      menuIcon.classList.toggle("fa-bars", !isOpen);
      menuIcon.classList.toggle("fa-xmark", isOpen);
    }
  });
}

const revealItems = document.querySelectorAll(
  ".section, article, form, main > section:not(:first-child)"
);

revealItems.forEach((item) => item.classList.add("reveal"));

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  },
  { threshold: 0.12 }
);

revealItems.forEach((item) => observer.observe(item));

const contactForms = document.querySelectorAll("[data-contact-form]");

const phonePattern = /^[0-9+\-\s()]{7,15}$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function setFormStatus(formStatus, message, type = "info") {
  if (!formStatus) return;

  formStatus.textContent = message;
  formStatus.classList.remove("text-red-300", "text-red-600", "text-emerald-300", "text-emerald-700");

  if (type === "error") {
    formStatus.classList.add(formStatus.classList.contains("text-teal") ? "text-red-600" : "text-red-300");
  }

  if (type === "success") {
    formStatus.classList.add(formStatus.classList.contains("text-teal") ? "text-emerald-700" : "text-emerald-300");
  }
}

function markField(field, hasError) {
  field.classList.toggle("border-red-400", hasError);
  field.classList.toggle("ring-4", hasError);
  field.classList.toggle("ring-red-500/20", hasError);
  field.setAttribute("aria-invalid", String(hasError));
}

function validateContactForm(contactForm) {
  const nameField = contactForm.elements.name;
  const phoneField = contactForm.elements.phone;
  const emailField = contactForm.elements.email;
  const errors = [];

  [nameField, phoneField, emailField].forEach((field) => {
    if (field) markField(field, false);
  });

  if (!nameField?.value.trim()) {
    errors.push("Name is required.");
    if (nameField) markField(nameField, true);
  }

  if (!phoneField?.value.trim()) {
    errors.push("Phone number is required.");
    if (phoneField) markField(phoneField, true);
  } else if (!phonePattern.test(phoneField.value.trim())) {
    errors.push("Enter a valid phone number.");
    markField(phoneField, true);
  }

  if (emailField?.value.trim() && !emailPattern.test(emailField.value.trim())) {
    errors.push("Enter a valid email address.");
    markField(emailField, true);
  }

  return errors;
}

contactForms.forEach((contactForm) => {
  contactForm.noValidate = true;

  contactForm.querySelectorAll("input, textarea").forEach((field) => {
    field.addEventListener("input", () => markField(field, false));
  });

  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formStatus = contactForm.querySelector("[data-form-status]");
    const submitButton = contactForm.querySelector("button[type='submit']");
    const validationErrors = validateContactForm(contactForm);

    if (validationErrors.length) {
      setFormStatus(formStatus, validationErrors[0], "error");
      const invalidField = contactForm.querySelector("[aria-invalid='true']");
      if (invalidField) invalidField.focus();
      return;
    }

    setFormStatus(formStatus, "Sending enquiry...");
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.classList.add("cursor-not-allowed", "opacity-70");
    }

    const formData = new FormData(contactForm);
    const payload = Object.fromEntries(formData.entries());
    payload.page = document.title;

    try {
      const response = await fetch("http://localhost:5001/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      if (!response.ok || !result.ok) {
        throw new Error(result.message || "Unable to send enquiry.");
      }

      contactForm.reset();
      setFormStatus(formStatus, result.message, "success");
    } catch (error) {
      setFormStatus(formStatus, error.message || "Unable to send enquiry now.", "error");
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.classList.remove("cursor-not-allowed", "opacity-70");
      }
    }
  });
});

const policyContent = {
  terms: {
    title: "Terms & Conditions",
    body: [
      "This is sample terms content for SVT Builders & Promoters.",
      "Project estimates, timelines and deliverables are confirmed only after site review, requirement discussion and written approval.",
      "Images and content shown on this website are for presentation purposes. Final materials, specifications and execution details may vary based on project scope.",
      "Clients are requested to verify quotation details, payment stages and service inclusions before work begins."
    ],
  },
  privacy: {
    title: "Privacy Policy",
    body: [
      "This is sample privacy content for SVT Builders & Promoters.",
      "Information submitted through enquiry forms may include name, phone number, email, address and project purpose.",
      "These details are used only to respond to enquiries, plan consultations and provide construction-related communication.",
      "SVT Builders does not sell personal enquiry information. Clients can request correction or removal of submitted details."
    ],
  },
};

function openPolicyModal(type) {
  const content = policyContent[type];
  if (!content) return;

  const existingModal = document.querySelector("[data-policy-modal]");
  if (existingModal) existingModal.remove();

  const modal = document.createElement("div");
  modal.setAttribute("data-policy-modal", "");
  modal.className = "fixed inset-0 z-50 grid place-items-center bg-black/60 px-5 backdrop-blur-md";
  modal.innerHTML = `
    <div class="max-h-[86vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/20 bg-white/90 p-6 text-ink shadow-2xl backdrop-blur-xl">
      <div class="mb-4 flex items-start justify-between gap-4">
        <div>
          <span class="mb-2 block text-xs font-black uppercase text-teal">SVT Builders & Promoters</span>
          <h2 class="text-3xl font-black">${content.title}</h2>
        </div>
        <button class="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-charcoal text-white hover:bg-brass hover:text-[#14100b]" type="button" data-policy-close aria-label="Close modal">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
      <div class="grid gap-3 text-sm leading-7 text-muted">
        ${content.body.map((item) => `<p>${item}</p>`).join("")}
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  document.body.style.overflow = "hidden";

  modal.addEventListener("click", (event) => {
    if (event.target === modal || event.target.closest("[data-policy-close]")) {
      modal.remove();
      document.body.style.overflow = "";
    }
  });
}

document.querySelectorAll("[data-policy]").forEach((button) => {
  button.addEventListener("click", () => openPolicyModal(button.dataset.policy));
});
