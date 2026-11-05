const form = document.querySelector("#signup-form");
const statusEl = document.querySelector("#form-status");

const fields = {
  email: document.querySelector("#email"),
  country: document.querySelector("#country"),
  postal: document.querySelector("#postal"),
  password: document.querySelector("#password"),
  confirm: document.querySelector("#confirm"),
};

const postalRules = {
  ph: { name: "the Philippines", pattern: /^\d{4}$/, example: "1000" },
  ke: { name: "Kenya", pattern: /^\d{5}$/, example: "00100" },
  us: { name: "the United States", pattern: /^\d{5}(-\d{4})?$/, example: "90210 or 90210-1234" },
  ca: { name: "Canada", pattern: /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/, example: "K1A 0B1" },
  gb: { name: "the United Kingdom", pattern: /^[A-Za-z]{1,2}\d[A-Za-z\d]?\s?\d[A-Za-z]{2}$/, example: "SW1A 1AA" },
};

// Each validator returns an error message, or "" when the field is fine
const validators = {
  email(input) {
    const value = input.value.trim();
    if (!value) {
      return "Please enter your email address.";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return "Enter a valid email, like name@example.com.";
    }
    return "";
  },

  country(input) {
    return input.value ? "" : "Please choose your country.";
  },

  postal(input) {
    const rule = postalRules[fields.country.value];
    const value = input.value.trim();

    if (!rule) {
      return "Choose your country first.";
    }
    if (!value) {
      return "Please enter your postal code.";
    }
    if (!rule.pattern.test(value)) {
      return "A postal code for " + rule.name + " looks like: " + rule.example + ".";
    }
    return "";
  },

  password(input) {
    const value = input.value;
    if (!value) {
      return "Please create a password.";
    }
    if (value.length < 8) {
      return "Use at least 8 characters (you have " + value.length + ").";
    }
    if (!/[A-Za-z]/.test(value) || !/\d/.test(value)) {
      return "Include at least one letter and one number.";
    }
    return "";
  },

  confirm(input) {
    if (!input.value) {
      return "Please confirm your password.";
    }
    if (input.value !== fields.password.value) {
      return "The passwords do not match.";
    }
    return "";
  },
};

const touched = new Set();

function validateField(name) {
  const input = fields[name];
  const message = validators[name](input);

  // Tell the Constraint Validation API about the result
  input.setCustomValidity(message);

  const errorEl = document.querySelector("#" + name + "-error");
  const show = touched.has(name);

  errorEl.textContent = show ? message : "";
  input.classList.toggle("is-invalid", show && message !== "");
  input.classList.toggle("is-valid", show && message === "");

  return message === "";
}

function revalidateRelated(name) {
  if (name === "country" && touched.has("postal")) {
    validateField("postal");
  }
  if (name === "password" && touched.has("confirm")) {
    validateField("confirm");
  }
}

Object.keys(fields).forEach((name) => {
  const input = fields[name];

  ["input", "change"].forEach((eventName) => {
    input.addEventListener(eventName, () => {
      touched.add(name);
      validateField(name);
      revalidateRelated(name);
    });
  });

  input.addEventListener("blur", () => {
    touched.add(name);
    validateField(name);
  });
});

function resetFormUi() {
  touched.clear();
  Object.keys(fields).forEach((name) => {
    const input = fields[name];
    input.setCustomValidity("");
    input.classList.remove("is-invalid", "is-valid");
    document.querySelector("#" + name + "-error").textContent = "";
  });
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  Object.keys(fields).forEach((name) => touched.add(name));
  const results = Object.keys(fields).map((name) => ({
    name,
    valid: validateField(name),
  }));

  const firstInvalid = results.find((result) => !result.valid);

  if (firstInvalid) {
    statusEl.textContent = "Please fix the highlighted fields before submitting.";
    statusEl.className = "error-status";
    fields[firstInvalid.name].focus();
    return;
  }

  statusEl.textContent = "High five! 🙌 Your form looks great.";
  statusEl.className = "success-status";
  form.reset();
  resetFormUi();
});