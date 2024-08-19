use crate::{FnArg, Parser, Token, Tokens, Val};
use log::warn;
use std::collections::HashMap;
use std::future::Future;

pub trait TemplateCallback {
    fn run(&self, fn_name: &str, args: HashMap<String, String>) -> impl Future<Output = Result<String, String>> + Send;
}

pub async fn parse_and_render<T>(
    template: &str,
    vars: &HashMap<String, String>,
    cb: &Box<T>,
) -> String
where
    T: TemplateCallback,
{
    let mut p = Parser::new(template);
    let tokens = p.parse();
    render(tokens, vars, cb).await
}

pub async fn render<T>(tokens: Tokens, vars: &HashMap<String, String>, cb: &Box<T>) -> String
where
    T: TemplateCallback,
{
    let mut doc_str: Vec<String> = Vec::new();

    for t in tokens.tokens {
        match t {
            Token::Raw { text } => doc_str.push(text),
            Token::Tag { val } => doc_str.push(render_tag(val, &vars, cb).await),
            Token::Eof => {}
        }
    }

    doc_str.join("")
}

async fn render_tag<T>(val: Val, vars: &HashMap<String, String>, cb: &Box<T>) -> String
where
    T: TemplateCallback,
{
    match val {
        Val::Str { text } => text.into(),
        Val::Var { name } => match vars.get(name.as_str()) {
            Some(v) => v.to_string(),
            None => "".into(),
        },
        Val::Fn { name, args } => {
            let empty = "".to_string();
            let mut resolved_args: HashMap<String, String> = HashMap::new();
            for a in args {
                let (k, v) = match a {
                    FnArg {
                        name,
                        value: Val::Str { text },
                    } => (name.to_string(), text.to_string()),
                    FnArg {
                        name,
                        value: Val::Var { name: var_name },
                    } => (
                        name.to_string(),
                        vars.get(var_name.as_str()).unwrap_or(&empty).to_string(),
                    ),
                    FnArg { name, value: val } => {
                        let r = Box::pin(render_tag(val.clone(), vars, cb)).await;
                        (name.to_string(), r)
                    }
                };
                resolved_args.insert(k, v);
            }
            match cb.run(name.as_str(), resolved_args.clone()).await {
                Ok(s) => s,
                Err(e) => {
                    warn!(
                        "Failed to run template callback {}({:?}): {}",
                        name, resolved_args, e
                    );
                    "".to_string()
                }
            }
        }
        Val::Null => "".into(),
    }
}

#[cfg(test)]
mod tests {
    use crate::renderer::TemplateCallback;
    use crate::*;
    use std::collections::HashMap;

    struct EmptyCB {}

    impl TemplateCallback for EmptyCB {
        async fn run(&self, _fn_name: &str, _args: HashMap<String, String>) -> Result<String, String>{
            todo!()
        }
    }

    #[tokio::test]
    async fn render_empty() {
        let empty_cb = Box::new(EmptyCB {});
        let template = "";
        let vars = HashMap::new();
        let result = "";
        assert_eq!(
            parse_and_render(template, &vars, &empty_cb).await,
            result.to_string()
        );
    }

    #[tokio::test]
    async fn render_text_only() {
        let empty_cb = Box::new(EmptyCB {});
        let template = "Hello World!";
        let vars = HashMap::new();
        let result = "Hello World!";
        assert_eq!(
            parse_and_render(template, &vars, &empty_cb).await,
            result.to_string()
        );
    }

    #[tokio::test]
    async fn render_simple() {
        let empty_cb = Box::new(EmptyCB {});
        let template = "${[ foo ]}";
        let vars = HashMap::from([("foo".to_string(), "bar".to_string())]);
        let result = "bar";
        assert_eq!(
            parse_and_render(template, &vars, &empty_cb).await,
            result.to_string()
        );
    }

    #[tokio::test]
    async fn render_surrounded() {
        let empty_cb = Box::new(EmptyCB {});
        let template = "hello ${[ word ]} world!";
        let vars = HashMap::from([("word".to_string(), "cruel".to_string())]);
        let result = "hello cruel world!";
        assert_eq!(
            parse_and_render(template, &vars, &empty_cb).await,
            result.to_string()
        );
    }

    #[tokio::test]
    async fn render_valid_fn() {
        let vars = HashMap::new();
        let template = r#"${[ say_hello(a="John", b="Kate") ]}"#;
        let result = r#"say_hello: 2, Some("John") Some("Kate")"#;

        struct CB {}
        impl TemplateCallback for CB {
            async fn run(
                &self,
                fn_name: &str,
                args: HashMap<String, String>,
            ) -> Result<String, String> {
                Ok(format!(
                    "{fn_name}: {}, {:?} {:?}",
                    args.len(),
                    args.get("a"),
                    args.get("b")
                ))
            }
        }
        assert_eq!(
            parse_and_render(template, &vars, &Box::new(CB {})).await,
            result
        );
    }

    #[tokio::test]
    async fn render_nested_fn() {
        let vars = HashMap::new();
        let template = r#"${[ upper(foo=secret()) ]}"#;
        let result = r#"ABC"#;
        struct CB {}
        impl TemplateCallback for CB {
            async fn run(
                &self,
                fn_name: &str,
                args: HashMap<String, String>,
            ) -> Result<String, String> {
                Ok(match fn_name {
                    "secret" => "abc".to_string(),
                    "upper" => args["foo"].to_string().to_uppercase(),
                    _ => "".to_string(),
                })
            }
        }

        assert_eq!(
            parse_and_render(template, &vars, &Box::new(CB {})).await,
            result.to_string()
        );
    }

    #[tokio::test]
    async fn render_fn_err() {
        let vars = HashMap::new();
        let template = r#"${[ error() ]}"#;
        let result = r#""#;

        struct CB {}
        impl TemplateCallback for CB {
            async fn run(
                &self,
                _fn_name: &str,
                _args: HashMap<String, String>,
            ) -> Result<String, String> {
                Err("Failed to do it!".to_string())
            }
        }

        assert_eq!(
            parse_and_render(template, &vars, &Box::new(CB {})).await,
            result.to_string()
        );
    }
}
