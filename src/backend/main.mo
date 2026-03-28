import OutCall "http-outcalls/outcall";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Time "mo:core/Time";
import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import List "mo:core/List";
import Text "mo:core/Text";
import Principal "mo:core/Principal";

actor {
  module GeneratedContent {
    public type ContentType = {
      #blog;
      #story;
      #email;
      #resume;
      #socialMedia;
      #tamilContent;
      #script;
      #template;
    };

    public type Tone = { #formal; #casual; #funny; #emotional };

    public type Length = { #short; #medium; #long };

    public type Language = { #english; #tamil; #hinglish };
  };

  func compareByTimestamp(a : GeneratedContent, b : GeneratedContent) : Order.Order {
    Int.compare(b.timestamp, a.timestamp);
  };

  type GeneratedContent = {
    id : Text;
    contentType : GeneratedContent.ContentType;
    tone : GeneratedContent.Tone;
    length : GeneratedContent.Length;
    language : GeneratedContent.Language;
    originalPrompt : Text;
    generatedText : Text;
    timestamp : Int;
  };

  type RewriteOptions = {
    simplify : Bool;
    makeProfessional : Bool;
    makeEmotional : Bool;
    translate : Bool;
    targetLanguage : ?GeneratedContent.Language;
  };

  type RewriteRequest = {
    originalText : Text;
    options : RewriteOptions;
    tone : GeneratedContent.Tone;
    language : GeneratedContent.Language;
  };

  let userContents = Map.empty<Principal, List.List<GeneratedContent>>();
  let templateCache = Map.empty<Text, Text>();

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  // Generate text using external AI API (placeholder)
  func makePostOutcall(url : Text, body : Text) : async Text {
    await OutCall.httpPostRequest(url, [], body, transform);
  };

  func contentTypeToText(contentType : GeneratedContent.ContentType) : Text {
    switch (contentType) {
      case (#blog) { "blog" };
      case (#story) { "story" };
      case (#email) { "email" };
      case (#resume) { "resume" };
      case (#socialMedia) { "socialMedia" };
      case (#tamilContent) { "tamilContent" };
      case (#script) { "script" };
      case (#template) { "template" };
    };
  };

  func toneToText(tone : GeneratedContent.Tone) : Text {
    switch (tone) {
      case (#formal) { "formal" };
      case (#casual) { "casual" };
      case (#funny) { "funny" };
      case (#emotional) { "emotional" };
    };
  };

  func lengthToText(length : GeneratedContent.Length) : Text {
    switch (length) {
      case (#short) { "short" };
      case (#medium) { "medium" };
      case (#long) { "long" };
    };
  };

  func languageToText(language : GeneratedContent.Language) : Text {
    switch (language) {
      case (#english) { "english" };
      case (#tamil) { "tamil" };
      case (#hinglish) { "hinglish" };
    };
  };

  public shared ({ caller }) func generateContent(
    contentType : GeneratedContent.ContentType,
    tone : GeneratedContent.Tone,
    length : GeneratedContent.Length,
    language : GeneratedContent.Language,
    prompt : Text,
  ) : async Text {
    let endpoint = "https://placeholder-ai-api.com/generate";
    let params = "type=" # contentTypeToText(contentType) # "&tone=" # toneToText(tone) # "&length=" # lengthToText(length) # "&lang=" # languageToText(language) # "&prompt=" # prompt;

    let generatedText = await makePostOutcall(endpoint, params);
    let newContent : GeneratedContent = {
      id = Time.now().toText();
      contentType;
      tone;
      length;
      language;
      originalPrompt = prompt;
      generatedText;
      timestamp = Time.now();
    };

    let existingContents = switch (userContents.get(caller)) {
      case (null) { List.empty<GeneratedContent>() };
      case (?list) { list };
    };
    existingContents.add(newContent);
    userContents.add(caller, existingContents);

    generatedText;
  };

  public shared ({ caller }) func rewriteText(rewriteRequest : RewriteRequest) : async Text {
    let endpoint = "https://placeholder-ai-api.com/rewrite";
    let params = "original=" # rewriteRequest.originalText # "&tone=" # toneToText(rewriteRequest.tone) # "&lang=" # languageToText(rewriteRequest.language);

    await makePostOutcall(endpoint, params);
  };

  public shared ({ caller }) func getTemplate(templateName : Text) : async Text {
    switch (templateCache.get(templateName)) {
      case (?cached) { return cached };
      case (null) { };
    };

    let endpoint = "https://placeholder-ai-api.com/template";
    let templateContent = await makePostOutcall(endpoint, templateName : Text);
    templateCache.add(templateName, templateContent);

    let newContent : GeneratedContent = {
      id = Time.now().toText();
      contentType = #template;
      tone = #formal;
      length = #medium;
      language = #english;
      originalPrompt = templateName;
      generatedText = templateContent;
      timestamp = Time.now();
    };

    let existingContents = switch (userContents.get(caller)) {
      case (null) { List.empty<GeneratedContent>() };
      case (?list) { list };
    };
    existingContents.add(newContent);
    userContents.add(caller, existingContents);

    templateContent;
  };

  public query ({ caller }) func getHistory() : async [GeneratedContent] {
    switch (userContents.get(caller)) {
      case (null) { Runtime.trap("No content found for user.") };
      case (?contents) {
        let contentsArray = contents.toArray();
        contentsArray.sort(compareByTimestamp);
      };
    };
  };

  public query ({ caller }) func getAllTemplates() : async [(Text, Text)] {
    templateCache.entries().toArray();
  };
};
