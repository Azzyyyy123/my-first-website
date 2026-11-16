const sections = document.querySelectorAll("main > section");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if ("IntersectionObserver" in window && !reduceMotion) {
    const sectionObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.12
    });

    document.documentElement.classList.add("js");
    sections.forEach((section) => {
        section.classList.add("reveal");
        sectionObserver.observe(section);
    });
}/* ==========================================================
   main.js – interactivity for the Problem-Solving page
   1. Show booking or feedback fields depending on the request type
   2. Validate the form
   3. Build an email message from the user's input (mailto: link)
   4. Dismiss the cookie reminder
   ========================================================== */
(function () {
  "use strict";

  var mealPhotoNotice = document.getElementById("meal-photo-notice");
  var mealPhotoNoticeDismiss = document.getElementById("meal-photo-notice-dismiss");
  if (mealPhotoNotice && mealPhotoNoticeDismiss) {
    mealPhotoNotice.showModal();
    mealPhotoNoticeDismiss.addEventListener("click", function () {
      mealPhotoNotice.close();
    });
  }

  // Fictional address that receives messages (.example is a reserved test domain)
  var RESTAURANT_EMAIL = "bookings@itankitchen.example";

  var form = document.getElementById("contact-form");
  if (!form) { return; } // Do nothing on pages without the form

  var typeSelect = document.getElementById("request-type");
  var bookingFields = document.getElementById("booking-fields");
  var feedbackFields = document.getElementById("feedback-fields");
  var errorBox = document.getElementById("form-errors");
  var preview = document.getElementById("email-preview");

  /* ---------- 1. Show only the fields that match the request type ---------- */
  function updateFields() {
    bookingFields.hidden = typeSelect.value !== "booking";
    feedbackFields.hidden = typeSelect.value !== "feedback";
  }

  /* Return today's date as YYYY-MM-DD (local time) for the date input */
  function todayString() {
    var d = new Date();
    var month = String(d.getMonth() + 1).padStart(2, "0");
    var day = String(d.getDate()).padStart(2, "0");
    return d.getFullYear() + "-" + month + "-" + day;
  }

  /* ---------- 2. Validation: returns a list of problems in plain English ---------- */
  function validate(values) {
    var errors = [];
    var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (values.name.length < 2) { errors.push("Enter your name."); }
    if (!emailPattern.test(values.email)) { errors.push("Enter a valid email address, such as name@example.com."); }
    if (values.type === "") { errors.push("Choose whether this is a booking, feedback or an enquiry."); }

    if (values.type === "booking") {
      if (values.date === "" || values.date < todayString()) { errors.push("Choose a booking date that is today or later."); }
      if (values.time === "") { errors.push("Choose a booking time."); }
      var guests = Number(values.guests);
      if (!(guests >= 1 && guests <= 12)) { errors.push("Enter a number of guests between 1 and 12."); }
    }
    if (values.type === "feedback" && values.rating === "") { errors.push("Choose a rating for your visit."); }
    if ((values.type === "feedback" || values.type === "enquiry") && values.message.length < 5) {
      errors.push("Write a short message (at least 5 characters).");
    }
    if (!values.consent) { errors.push("Tick the box to agree to us using your details to reply."); }
    return errors;
  }

  /* ---------- 3. Build the subject and body of the email ---------- */
  function buildEmail(values) {
    var labels = { booking: "Table booking", feedback: "Feedback", enquiry: "Enquiry" };
    var subject = labels[values.type] + " from " + values.name;
    var lines = ["Name: " + values.name, "Email: " + values.email, "Request: " + labels[values.type]];

    if (values.type === "booking") {
      lines.push("Date: " + values.date, "Time: " + values.time, "Guests: " + values.guests);
    }
    if (values.type === "feedback") { lines.push("Rating: " + values.rating + " out of 5"); }
    if (values.message !== "") { lines.push("", "Message:", values.message); }

    return { subject: subject, body: lines.join("\n") };
  }

  /* Read the current form values into one object */
  function readValues() {
    return {
      name: form.elements["name"].value.trim(),
      email: form.elements["email"].value.trim(),
      type: form.elements["type"].value,
      date: form.elements["date"].value,
      time: form.elements["time"].value,
      guests: form.elements["guests"].value,
      rating: form.elements["rating"].value,
      message: form.elements["message"].value.trim(),
      consent: form.elements["consent"].checked
    };
  }

  /* Show the list of errors above the form */
  function showErrors(errors) {
    errorBox.innerHTML = "";
    var heading = document.createElement("strong");
    heading.textContent = "Please fix the following:";
    var list = document.createElement("ul");
    errors.forEach(function (message) {
      var item = document.createElement("li");
      item.textContent = message;
      list.appendChild(item);
    });
    errorBox.appendChild(heading);
    errorBox.appendChild(list);
    errorBox.hidden = false;
    errorBox.focus();
  }

  /* ---------- Handle submit ---------- */
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var values = readValues();
    var errors = validate(values);

    if (errors.length > 0) {
      preview.hidden = true;
      showErrors(errors);
      return;
    }
    errorBox.hidden = true;

    var email = buildEmail(values);
    preview.textContent = "Message ready to send:\n\nTo: " + RESTAURANT_EMAIL + "\nSubject: " + email.subject + "\n\n" + email.body;
    preview.hidden = false;

    // encodeURIComponent keeps spaces, line breaks and symbols safe in the link
    window.location.href = "mailto:" + RESTAURANT_EMAIL +
      "?subject=" + encodeURIComponent(email.subject) +
      "&body=" + encodeURIComponent(email.body);
  });

  typeSelect.addEventListener("change", updateFields);
  form.elements["date"].min = todayString();
  updateFields();

  /* ---------- 4. Cookie reminder: hide it when dismissed ---------- */
  // Nothing is stored: this site sets no tracking cookies, so the reminder
  // simply closes for the current visit.
  var banner = document.getElementById("cookie-banner");
  var dismiss = document.getElementById("cookie-dismiss");
  if (banner && dismiss) {
    dismiss.addEventListener("click", function () { banner.hidden = true; });
  }
})();
