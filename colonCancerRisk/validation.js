var validationRules = {
    hispanic: {
        required: true
    },
    race: {
        required: {
            depends: function (el) {
                return $("[name='hispanic']:checked").val() == 1;
            }
        }
    },
    age: {
        required: true,
        min: 50,
        max: 85
    },
    gender: {
        required: true
    },
    height_feet: {
        require_from_group: [2, '.height-group']
    },
    height_inches: {
        require_from_group: [2, '.height-group']
    },
    weight: {
        required: true
    },
    veg_servings: {
        required: true
    },
    exam: {
        required: true
    },
    polyp: {
        required: {
            depends: function (el) {
                return $("[name='exam']").val() > 0;
            }
        }
    },
    medications: {
        required: true
    },
    asprin: {
        required: {
            depends: function (el) {
                return $("[name='medications']").val() == "0";
            }
        }
    },
    non_asprin: {
        required: {
            depends: function (el) {
                return $("[name='medications']").val() == "0";
            }
        }
    },
    activity: {
        required: true
    },
    moderate_months: {
        required: {
            depends: function (el) {
                return $("[name='activity']").val() == "0";
            }
        }
    },
    vigorous_months: {
        required: {
            depends: function (el) {
                return $("[name='activity']").val() == "0";
            }
        }
    },
    "family_cancer": {
        required: true
    },
    family_count: {
        required: {
            depends: function (el) {
                return $("[name='family_cancer']").val() == "0";
            }
        }
    },
    veg_amount: {
        required: {
            depends: function (el) {
                return $("[name='veg_servings']").val() > 0;
            }
        }
    },
    cigarettes: {
        required: {
            depends: function (el) {
                return $("[name='gender']:checked").val() == "Male";
            }
        }
    },
    smoke_age: {
        required: {
            depends: function (el) {
                return $("[name='gender']:checked").val() == "Male" && $("#cigarettes").val() === "0";
            }
        }
    },
    cigarettes_num: {
        required: {
            depends: function (el) {
                return $("#smoke_age").val() > 0;
            }
        }
    },
    smoke_now: {
        required: {
            depends: function (el) {
                return $("#smoke_age").val() > 0;
            }
        }
    },
    smoke_quit: {
        required: {
            depends: function (el) {
                return $("[name='smoke_now']:checked").val() == "0";
            }
        }
    },
    period: {
        required: {
            depends: function (el) {
                return $("[name='gender']:checked").val() == "Female";
            }
        }
    },
    last_period: {
        required: {
            depends: function (el) {
                return $("[name='period']:checked").val() == '1';
            }
        }
    },
    hormones: {
        required: {
            depends: function (el) {
                return $("[name='last_period']").val() == '2';
            }
        }
    }
};
var validationMessages = {
    hispanic: {
        required: "You must specify whether you consider yourself Hispanic or Latino"
    },
    race: {
        required: "Your race must be selected"
    },
    age: {
        required: "Age is required",
        min: "This calculator can only be used by people between the ages 50 and 85",
        max: "This calculator can only be used by people between the ages 50 and 85"
    },
    gender: {
        required: "Gender must be selected"
    },
    height_feet: {
        require_from_group: "Enter both feet(ft) and inches(inch) for height"
    },
    height_inches: {
        require_from_group: "Enter both feet(ft) and inches(inch) for height"
    },
    weight: {
        required: "Weight is required"
    },
    veg_servings: {
        required: "You must specify how many servings of vegetables you had in the past month"
    },
    veg_amount: {
        required: "You must specify the serving size of the vegetables"
    },
    exam: {
        required: "You must specify whether you had a colonoscopy or sigmoidoscopy exam in the last decade"
    },
    polyp: {
        required: "You must specify whther polyps were found during the exam"
    },
    medications: {
        required: "You must specify whether you have taken any medications in the past month"
    },
    asprin: {
        required: "You must specify whether you have taken any medications containing asprin in the past month"
    },
    non_asprin: {
        required: "You must specify whether you have taken any medications not containing asprin in the past month"
    },
    activity: {
        required: "You must specify whether you have exercised in the past year"
    },
    moderate_months: {
        required: "You must specify how many months you have participated in moderate exercise"
    },
    vigorous_months: {
        required: "You must specify how many months you have participated in vigorous exercise"
    },
    "family_cancer": {
        required: "You must specify whether any relatives had colorectal cancer"
    },
    "family_count": {
        required: "You must specify how many relatives had colorectal cancer"
    },
    cigarettes: {
        required: "You must specify whether you have smoked cigarettes"
    },
    cigarettes_num: {
        required: "You must specify the amount of cigarettes you have smoked regularly"
    },
    "smoke_age": {
        required: "You must specify the age you began smoking",
    },
    "smoke_now": {
        required: "You must specify whether you currently smoke",
    },
    smoke_quit: {
        required: "You must specify the age at which you last quit smoking"
    },
    period: {
        required: "You must specify whether you still have periods"
    },
    last_period: {
        required: "You must specify when you had your last period"
    },
    hormones: {
        required: "You must specify whether you are taking any female hormones"
    }
};

function validate() {
    $(document.forms.survey).validate({
        debug: true,


        igonore: ".ignore",
        highlight: function (element, errorClass, validClass) {
            if (element.type != "radio") {
                $(element).addClass(errorClass).removeClass(validClass);
            }
            $(element.form).find("label[for='" + element.name + "']")
                .addClass(errorClass);
        },
        unhighlight: function (element, errorClass, validClass) {
            if (element.type != "radio") {
                $(element).removeClass(errorClass).addClass(validClass);
            }
            $(element.form).find("label[for='" + element.name + "']")
                .removeClass(errorClass);
        },

        rules: validationRules,
        messages: validationMessages,
        errorLabelContainer: '#error',

        submitHandler: function (form) {
            $('#error').empty().css('display', 'none');
            $('#result').addClass('hide').empty();
            $('.error').removeClass('error');
            $.ajax({
                url: form.action,
                type: form.method,
                data: new FormData(form),
                processData: false,
                contentType: false,
                dataType: 'json'
            }).done(function (data) {
                if (data.success) {
                    displayResult(data.message);
                } else {
                    var message = "";
                    if (data.message) {
                        message += "<p>" + data.message + "</p>";
                    }
                    var index;
                    for (index in data.missing) {
                        $('#' + data.missing[index]).addClass('error');
                        message += "<p>The " + data.missing[index] + " question was not answered.</p>";
                    }
                    for (index in data.nonnumeric) {
                        $('#' + data.nonnumeric[index]).addClass('error');
                        message += "<p>The " + data.missing[index] + " question contained a nonnumeric answer.</p>";
                    }
                    $('#error').append(message).css('display', 'block');
                    document.getElementById("top").scrollIntoView();
                }
            }).fail(function (data) {
                if (data.responseJSON.message)
                    $('#error').append("<p>" + data.responseJSON.message + "</p>").css('display', 'block');
                document.getElementById("top").scrollIntoView();
            });
        }
    });
}

$(validate);
