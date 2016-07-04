/*
 Author : Divya Mamgai
 TagInput.js
 Version : 1.0
 2016
 */
(function ($, w, wO, d) {
    // For IE Support.
    if (('find' in Array.prototype) === false) {
        Array.prototype.find = function (filterFunction, testValue) {
            var This = this,
                Length = This.length;
            if (Length > 0) {
                for (var Index = 0; Index < Length; Index++) {
                    if (filterFunction.apply(testValue, [This[Index]]) === true)
                        return This[Index];
                }
            }
            return undefined;
        }
    }
    w.TagInput = function (element) {
        var $Element = $(element),
            ID = $Element.attr('id') || (new Date()),
            $TagInput = $("<div class=\"TagInput\"></div>").insertAfter($Element),
            $TagInputLabel = $('label[for=' + ID + ']', d),
            Options = {},
            GlueReplaceRegex,
            FontSize,
            TagArray = [],
            PublicPrototype = {
                /**
                 * @return {string}
                 */
                ToString: function () {
                    var String = '',
                        TagCount = TagArray.length,
                        LastIndex = TagCount - 1;
                    for (var TagIndex = 0; TagIndex < TagCount; TagIndex++) {
                        String += TagArray[TagIndex].Text + (TagIndex === LastIndex ? '' : Options.Glue);
                    }
                    return String;
                },
                UpdateValue: function () {
                    var Value = PublicPrototype.ToString();
                    $Element.val(Value);
                    $Element.trigger('TagInput:UpdateValue', [Value]);
                    return Value;
                },
                /**
                 * @return {boolean}
                 */
                AddTag: function (text) {
                    if ((text !== undefined) && (typeof text === 'string')) {
                        var Text = $.trim(text.replace(GlueReplaceRegex, ' '));
                        if (Text.length >= Options.MinLength) {
                            if (TagArray.find(PrivatePrototype.FindTag, Text) === undefined) {
                                var $Tag = $('<div class="TagItem Hide">' + Text + '<span class="' + Options.RemoveIcon + ' RemoveTag"></span></div>');
                                TagArray.push({
                                    Text: Text,
                                    $Tag: $Tag
                                });
                                $Element.before($Tag);
                                // Making it async so that we don't remove the Hide class as we create it, since we
                                // need it to animate.
                                setTimeout(function () {
                                    $Tag.removeClass('Hide');
                                }, 21);
                                $Element.trigger('TagInput:AddTag', [TagArray, $Tag, Text]);
                                return true;
                            }
                        }
                    }
                    return false;
                },
                RemoveTag: function ($tag, index) {
                    // We subtract 1 because label element takes up 1 index.
                    index = index || ($tag.index() - 1);
                    var Text = TagArray[index].Text;
                    TagArray.splice(index, 1);
                    $tag.remove();
                    $Element.trigger('TagInput:RemoveTag', [TagArray, Text]);
                },
                GetArray: function () {
                    return TagArray;
                },
                GetTextArray: function () {
                    var TextArray = [],
                        TagCount = TagArray.length;
                    for (var TagIndex = 0; TagIndex < TagCount; TagIndex++)
                        TextArray.push(TagArray[TagIndex].Text);
                    return TextArray;
                },
                /**
                 * @return {number}
                 */
                GetTagCount: function () {
                    return TagArray.length;
                },
                Private: undefined
            },
            PrivatePrototype = {
                /**
                 * @return {boolean}
                 */
                FindTag: function (tagObject) {
                    // Can't do === since this has String object whereas tagObject.Text is a primitive string value.
                    return tagObject.Text == this;
                },
                SetElementWidth: function () {
                    var Length = $Element.val().length + 1;
                    $Element.css('width', FontSize * Length);
                },
                TagInputOnClick: function () {
                    $Element.focus();
                },
                TagInputOnMouseEnter: function () {
                    $TagInput.addClass('Focus');
                },
                TagInputOnMouseLeave: function () {
                    if ($Element.is(':focus') === false) {
                        if (TagArray.length === 0) $TagInputLabel.removeClass(Options.LabelAnimationClass);
                        $TagInput.removeClass('Focus');
                    }
                },
                RemoveTagOnClick: function (event) {
                    event.stopPropagation();
                    event.preventDefault();
                    PublicPrototype.RemoveTag($(this).parent());
                    if (TagArray.length === 0) $TagInputLabel.removeClass(Options.LabelAnimationClass);
                },
                TagItemOnClick: function (event) {
                    event.stopPropagation();
                    event.preventDefault();
                    if ($Element.val().length === 0) {
                        var $Tag = $(this),
                            TagIndex = $Tag.index() - 1;
                        $Element.val(TagArray[TagIndex].Text).focus();
                        PublicPrototype.RemoveTag($Tag, TagIndex);
                    }
                },
                ElementOnFocus: function () {
                    if (TagArray.length === 0) $TagInputLabel.addClass(Options.LabelAnimationClass);
                    $TagInput.addClass('Focus');
                    // Add length restriction and empty the field.
                    $Element.val('').attr({
                        minlength: Options.MinLength,
                        maxlength: Options.MaxLength
                    }).removeClass('Hidden');
                },
                ElementOnBlur: function () {
                    if (TagArray.length === 0) $TagInputLabel.removeClass(Options.LabelAnimationClass);
                    $TagInput.removeClass('Focus');
                    // Remove length restriction.
                    $Element.addClass('Hidden').attr({
                        minlength: 0,
                        // Default Value - http://www.w3schools.com/tags/att_input_maxlength.asp
                        maxlength: 524288
                    });
                    PublicPrototype.UpdateValue();
                },
                ElementOnKeyDown: function (event) {
                    if (event.keyCode === 13) {
                        event.stopPropagation();
                        event.preventDefault();
                        if (PublicPrototype.AddTag($Element.val()) === true) {
                            $Element.val('');
                        }
                    } else if (event.keyCode === 8) {
                        if (TagArray.length > 0) {
                            if ($Element.val().length === 0)
                                PublicPrototype.RemoveTag($Element.prev());
                        }
                    } else if (event.key === Options.Glue) {
                        event.stopPropagation();
                        event.preventDefault();
                    }
                    PrivatePrototype.SetElementWidth();
                },
                ElementValidation: function () {
                    $Element.val(String($Element.val()).replace(GlueReplaceRegex, ' '));
                },
                ProcessValue: function () {
                    var ElementValue = $Element.val(),
                        TagItems = ElementValue.split(Options.Glue),
                        Length = TagItems.length;
                    for (var TagItemIndex = 0; TagItemIndex < Length; TagItemIndex++) {
                        PublicPrototype.AddTag(TagItems[TagItemIndex]);
                    }
                    if (TagArray.length > 0) {
                        $TagInputLabel.addClass(Options.LabelAnimationClass);
                        PublicPrototype.UpdateValue();
                    }
                },
                Initialize: function () {
                    Options = {
                        MinLength: $Element.attr('data-MinLength') || 1,
                        MaxLength: $Element.attr('data-MaxLength'),
                        Glue: $Element.attr('data-Glue') || ',',
                        RemoveIcon: $Element.attr('data-RemoveIcon') || 'glyphicon glyphicon-remove',
                        LabelAnimationClass: $Element.attr('data-LabelAnimationClass') || 'Hide'
                    };
                    FontSize = parseInt($Element.css('font-size'));
                    // Options.MinLength has to be >= 1 semantically.
                    if (Options.MinLength <= 0) Options.MinLength = 1;
                    // Options.Glue cannot be Space, this is because we replace the Options.Glue character by space
                    // on input.
                    if (Options.Glue === ' ') Options.Glue = ',';
                    GlueReplaceRegex = new RegExp(Options.Glue, 'g');
                    // If the label is not already created we need to make one otherwise prepend the existing one.
                    if ($TagInputLabel.length === 0) {
                        $Element.before(($TagInputLabel = $('<label for="' + ID + '">Enter Tags</label>')));
                    } else {
                        $TagInputLabel.prependTo($TagInput);
                    }
                    $TagInput
                        .on('click', PrivatePrototype.TagInputOnClick)
                        .on('mouseenter', PrivatePrototype.TagInputOnMouseEnter)
                        .on('mouseleave', PrivatePrototype.TagInputOnMouseLeave)
                        .on('click', '.RemoveTag', PrivatePrototype.RemoveTagOnClick)
                        .on('click', '.TagItem', PrivatePrototype.TagItemOnClick);
                    $Element
                        .appendTo($TagInput)
                        .on('focus', PrivatePrototype.ElementOnFocus)
                        .on('blur', PrivatePrototype.ElementOnBlur)
                        .on('keydown', PrivatePrototype.ElementOnKeyDown)
                        .on('input', PrivatePrototype.ElementValidation)
                        .on('change', PrivatePrototype.ElementValidation)
                        .addClass('Hidden');
                    PrivatePrototype.ProcessValue();
                }
            };
        PublicPrototype.Private = PrivatePrototype;
        PrivatePrototype.Initialize();
        return PublicPrototype;
    };
    $.fn.TagInput = function () {
        return this.each(function () {
            if ($.data(this, 'TagInput') === undefined) {
                $.data(this, 'TagInput', new TagInput(this));
            }
        });
    };
    $(function () {
        $('input[data-TagInput]', d).TagInput();
    });
})(jQuery, window, jQuery(window), document);