/*
 Author : Divya Mamgai
 TagInput.js
 Version : 1.1
 2016
 */
;(function ($, w, wO, d) {
    /*
     For IE Support Array.find polyFill
     Source - https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Array/find#Polyfill
     */
    if (!Array.prototype.find) {
        Array.prototype.find = function (predicate) {
            if (this == null) {
                throw new TypeError('Array.prototype.find called on null or undefined');
            }
            if (typeof predicate !== 'function') {
                throw new TypeError('predicate must be a function');
            }
            var list = Object(this),
                length = list.length >>> 0,
                thisArg = arguments[1],
                value;

            for (var i = 0; i < length; i++) {
                value = list[i];
                if (predicate.call(thisArg, value, i, list)) {
                    return value;
                }
            }
            return undefined;
        };
    }
    var TagInputTagItemDOMCache = $('<div class="TagItem Hide"><span class="TagText"></span><span class="RemoveTag"></span></div>'),
        TagInputHiddenInputDOMCache = $('<input type="hidden">');
    w.TagInput = function (element) {
        var $Element = $(element),
            ID = $Element.attr('id') || Math.round(Math.random() * 1e9),
            $TagInput = $("<div class=\"TagInput\">\n    <input type=\"text\" class=\"TagInputText\">\n</div>").insertAfter($Element),
            $TagInputLabel = $('label[for=' + ID + ']', d),
            $TagInputText = $TagInput.find('.TagInputText'),
            Options = {},
            GlueReplaceRegex,
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
                                var $Tag = TagInputTagItemDOMCache.clone();
                                $Tag.find('.TagText').html(Text);
                                $Tag.find('.RemoveTag').addClass(Options.RemoveIcon);
                                TagArray.push({
                                    Text: Text,
                                    $Tag: $Tag
                                });
                                $TagInputText.before($Tag);
                                setTimeout(function () {
                                    $Tag.removeClass('Hide');
                                }, 21);
                                PublicPrototype.UpdateValue();
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
                    PublicPrototype.UpdateValue();
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
                /**
                 * @return {string}
                 */
                ConvertToHiddenInput: function () {
                    var TagCount = TagArray.length,
                        Name = $Element.attr('name') + '[]',
                        HiddenInputDOMCache = TagInputHiddenInputDOMCache.clone().attr('name', Name);
                    for (var TagIndex = 0; TagIndex < TagCount; TagIndex++) {
                        $TagInput.after(HiddenInputDOMCache.clone().val(TagArray[TagIndex].Text));
                    }
                    $Element.attr('disabled', 'disabled');
                    return Name;
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
                TagInputOnClick: function () {
                    $TagInputText.focus();
                },
                TagInputOnMouseEnter: function () {
                    $TagInput.addClass('Focus');
                },
                TagInputOnMouseLeave: function () {
                    if ($TagInputText.is(':focus') === false) {
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
                    if ($TagInputText.val().length === 0) {
                        var $Tag = $(this),
                            TagIndex = $Tag.index() - 1,
                            Text = TagArray[TagIndex].Text;
                        $TagInputText.val(Text).focus();
                        PublicPrototype.RemoveTag($Tag, TagIndex);
                    }
                },
                TagInputTextOnFocus: function () {
                    if (TagArray.length === 0 && $TagInputText.val().length === 0) $TagInputLabel.addClass(Options.LabelAnimationClass);
                    $TagInput.addClass('Focus');
                },
                TagInputTextOnBlur: function () {
                    if (TagArray.length === 0 && $TagInputText.val().length === 0) $TagInputLabel.removeClass(Options.LabelAnimationClass);
                    $TagInput.removeClass('Focus');
                },
                TagInputTextOnKeyDown: function (event) {
                    if (event.keyCode === 13) {
                        event.stopPropagation();
                        event.preventDefault();
                        if (PublicPrototype.AddTag($TagInputText.val()) === true) {
                            $TagInputText.val('');
                        }
                    } else if (event.keyCode === 8) {
                        if (TagArray.length > 0) {
                            if ($TagInputText.val().length === 0)
                                PublicPrototype.RemoveTag($TagInputText.prev());
                        }
                    } else if (event.key === Options.Glue) {
                        event.stopPropagation();
                        event.preventDefault();
                    }
                },
                ElementValidation: function () {
                    $TagInput.val(String($TagInput.val()).replace(GlueReplaceRegex, ' '));
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
                    $TagInputText
                        .attr({
                            minlength: Options.MinLength,
                            maxlength: Options.MaxLength
                        })
                        .on('focus', PrivatePrototype.TagInputTextOnFocus)
                        .on('blur', PrivatePrototype.TagInputTextOnBlur)
                        .on('keydown', PrivatePrototype.TagInputTextOnKeyDown)
                        .on('input', PrivatePrototype.ElementValidation)
                        .on('change', PrivatePrototype.ElementValidation);
                    $Element
                        .attr('tabindex', -1)
                        .addClass('TagInputElement')
                        .on('focus', function (event) {
                            event.stopPropagation();
                            event.preventDefault();
                            $TagInputText.focus();
                        })
                        .appendTo($TagInput);
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